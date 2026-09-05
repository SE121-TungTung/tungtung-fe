import React from 'react'
import s from '../ChatDetailsPanel.module.css'
import DeleteIcon from '@/assets/Trash Bin Delete.svg'
import SearchIcon from '@/assets/Action Eye Tracking.svg'
import AddUserIcon from '@/assets/User Add.svg'
import EditIcon from '@/assets/Edit Pen.svg'
import LeaveIcon from '@/assets/Close X Thin.svg'
import BlockIcon from '@/assets/Block.svg'

interface ChatActionsMenuProps {
    isGroup: boolean
    isAdmin: boolean
    onAddMember: () => void
    onRename: () => void
    onChangeAvatarClick: () => void
    onSearchClick: () => void
    onLeaveClick: () => void
    onDeleteClick: () => void
    onBlockClick: () => void
}

export const ChatActionsMenu: React.FC<ChatActionsMenuProps> = ({
    isGroup,
    isAdmin,
    onAddMember,
    onRename,
    onChangeAvatarClick,
    onSearchClick,
    onLeaveClick,
    onDeleteClick,
    onBlockClick,
}) => {
    return (
        <ul className={s.menuList}>
            {isGroup ? (
                <>
                    {isAdmin && (
                        <>
                            <li className={s.menuItem} onClick={onAddMember}>
                                <img src={AddUserIcon} alt="Add" /> Thêm thành
                                viên
                            </li>
                            <li className={s.menuItem} onClick={onRename}>
                                <img src={EditIcon} alt="Edit" /> Đổi tên nhóm
                            </li>
                            <li
                                className={s.menuItem}
                                onClick={onChangeAvatarClick}
                            >
                                <img src={EditIcon} alt="Avatar" /> Đổi ảnh đại
                                diện
                            </li>
                        </>
                    )}
                    <li className={s.menuItem} onClick={onSearchClick}>
                        <img src={SearchIcon} alt="Search" /> Tìm kiếm tin nhắn
                    </li>
                    <li className={s.divider} />
                    <li
                        className={`${s.menuItem} ${s.danger}`}
                        onClick={onLeaveClick}
                    >
                        <img src={LeaveIcon} alt="Leave" /> Rời khỏi nhóm
                    </li>
                    {isAdmin && (
                        <>
                            <li className={s.divider} />
                            <li
                                className={`${s.menuItem} ${s.danger}`}
                                onClick={onDeleteClick}
                            >
                                <img src={DeleteIcon} alt="Delete" /> Xóa nhóm
                                vĩnh viễn
                            </li>
                        </>
                    )}
                </>
            ) : (
                <>
                    <li className={s.menuItem} onClick={onSearchClick}>
                        <img src={SearchIcon} alt="Search" /> Tìm kiếm tin nhắn
                    </li>
                    <li className={s.divider} />
                    <li
                        className={`${s.menuItem} ${s.danger}`}
                        onClick={onBlockClick}
                    >
                        <img src={BlockIcon} alt="Block" /> Chặn người này
                    </li>
                    <li
                        className={`${s.menuItem} ${s.danger}`}
                        onClick={onDeleteClick}
                    >
                        <img src={DeleteIcon} alt="Delete" /> Xóa cuộc trò
                        chuyện
                    </li>
                </>
            )}
        </ul>
    )
}
