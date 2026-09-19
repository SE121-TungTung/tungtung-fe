/**
 * ReactionBar.tsx
 * Component hiển thị 3 nút reaction (Like / Heart / Understood) dùng Icon SVG.
 *
 * - Optimistic Update: cập nhật count ngay khi click, rollback nếu API lỗi.
 * - Hỗ trợ toggle: click lần 2 cùng type → bỏ reaction.
 * - Cho phép active nhiều type cùng lúc trên 1 bài viết.
 */

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    type ReactionsSummary,
    type ReactionType,
    togglePostReaction,
} from '@/lib/classes'
import { queryKeys } from '@/lib/queryKeys'
import s from './ReactionBar.module.css'

interface ReactionBarProps {
    classId: string
    postId: string
    summary: ReactionsSummary
    /** Chỉ được react nếu isInteractive = true (thành viên lớp) */
    isInteractive?: boolean
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const ThumbsUpIcon = ({ filled }: { filled?: boolean }) => (
    <svg
        viewBox="0 0 24 24"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="18"
        height="18"
        aria-hidden="true"
    >
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
)

const HeartIcon = ({ filled }: { filled?: boolean }) => (
    <svg
        viewBox="0 0 24 24"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="18"
        height="18"
        aria-hidden="true"
    >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
)

const CheckBadgeIcon = ({ filled }: { filled?: boolean }) => (
    <svg
        viewBox="0 0 24 24"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="18"
        height="18"
        aria-hidden="true"
    >
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        <path d="M8 12l2.5 2.5L16 9" />
    </svg>
)

// ─── Reaction config ──────────────────────────────────────────────────────────

const REACTIONS: Array<{
    type: ReactionType
    label: string
    Icon: typeof ThumbsUpIcon
    activeColor: string
}> = [
    {
        type: 'like',
        label: 'Thích',
        Icon: ThumbsUpIcon,
        activeColor: '#3b82f6',
    },
    {
        type: 'heart',
        label: 'Yêu thích',
        Icon: HeartIcon,
        activeColor: '#ef4444',
    },
    {
        type: 'understood',
        label: 'Đã hiểu',
        Icon: CheckBadgeIcon,
        activeColor: '#22c55e',
    },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function ReactionBar({
    classId,
    postId,
    summary: initialSummary,
    isInteractive = true,
}: ReactionBarProps) {
    const queryClient = useQueryClient()
    // Local optimistic state để cập nhật UI ngay lập tức
    const [optimisticSummary, setOptimisticSummary] =
        useState<ReactionsSummary>(initialSummary)

    // Sync optimistic state khi server data thay đổi (refetch / remount)
    useEffect(() => {
        setOptimisticSummary(initialSummary)
    }, [
        initialSummary.like,
        initialSummary.heart,
        initialSummary.understood,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(initialSummary.user_reactions),
    ])

    const mutation = useMutation({
        mutationFn: (reactionType: ReactionType) =>
            togglePostReaction(classId, postId, reactionType),
        onMutate: async (reactionType) => {
            // 1. Snapshot state cũ để rollback
            const prev = optimisticSummary

            // 2. Optimistic update
            setOptimisticSummary((curr) => {
                const isActive = curr.user_reactions.includes(reactionType)
                const newCount = isActive
                    ? Math.max(0, curr[reactionType] - 1)
                    : curr[reactionType] + 1
                const newUserReactions = isActive
                    ? curr.user_reactions.filter((r) => r !== reactionType)
                    : [...curr.user_reactions, reactionType]
                return {
                    ...curr,
                    [reactionType]: newCount,
                    user_reactions: newUserReactions,
                }
            })

            return { prev }
        },
        onSuccess: (data) => {
            // Sync với state thực từ server
            setOptimisticSummary(data.summary)
            // Invalidate posts cache để cập nhật comment_count và reactions_summary
            queryClient.invalidateQueries({
                queryKey: queryKeys.classes.postReactions(classId, postId),
            })
        },
        onError: (_err, _reactionType, ctx) => {
            // Rollback về snapshot
            if (ctx?.prev) setOptimisticSummary(ctx.prev)
        },
    })

    const handleToggle = (reactionType: ReactionType) => {
        if (!isInteractive || mutation.isPending) return
        mutation.mutate(reactionType)
    }

    return (
        <div
            className={s.reactionBar}
            role="group"
            aria-label="Reactions bài viết"
        >
            {REACTIONS.map(({ type, label, Icon, activeColor }) => {
                const isActive = optimisticSummary.user_reactions.includes(type)
                const count = optimisticSummary[type]

                return (
                    <button
                        key={type}
                        type="button"
                        className={`${s.reactionBtn} ${isActive ? s.active : ''}`}
                        style={
                            isActive
                                ? ({
                                      '--active-color': activeColor,
                                  } as React.CSSProperties)
                                : undefined
                        }
                        onClick={() => handleToggle(type)}
                        disabled={!isInteractive}
                        aria-label={`${label} (${count})`}
                        aria-pressed={isActive}
                        title={label}
                    >
                        <span
                            className={s.reactionIcon}
                            style={
                                isActive ? { color: activeColor } : undefined
                            }
                        >
                            <Icon filled={isActive} />
                        </span>
                        {count > 0 && (
                            <span className={s.reactionCount}>{count}</span>
                        )}
                        <span className={s.reactionLabel}>{label}</span>
                    </button>
                )
            })}
        </div>
    )
}
