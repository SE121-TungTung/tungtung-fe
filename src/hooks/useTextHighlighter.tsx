import { useState, useCallback, useEffect } from 'react'

export interface HighlightInfo {
    id: string
    text: string
    startContainerPath: string
    startOffset: number
    endContainerPath: string
    endOffset: number
    color: string
}

const STORAGE_KEY_PREFIX = 'readingHighlights_'

function getElementXPath(element: HTMLElement): string {
    if (element.id) {
        return `//*[@id='${element.id}']`
    }
    if (element.tagName === 'BODY') {
        return '/html/body'
    }

    let ix = 0
    const siblings = element.parentNode?.childNodes || []
    for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i]
        if (sibling === element) {
            return (
                getElementXPath(element.parentNode as HTMLElement) +
                '/' +
                element.tagName.toLowerCase() +
                (ix > 0 ? `[${ix + 1}]` : '')
            )
        }
        if (
            sibling.nodeType === 1 &&
            (sibling as HTMLElement).tagName === element.tagName
        ) {
            ix++
        }
    }
    return ''
}

function getXPathForNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement as HTMLElement
        const base = getElementXPath(parent)
        const textNodes = Array.from(parent.childNodes).filter(
            (n) => n.nodeType === Node.TEXT_NODE
        ) as Node[]
        const idx = textNodes.indexOf(node) + 1
        return `${base}/text()[${idx}]`
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        return getElementXPath(node as HTMLElement)
    }
    return ''
}

function getNodeFromXPath(path: string, context: Node): Node | null {
    try {
        const result = document.evaluate(
            path,
            context,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        )
        return result.singleNodeValue
    } catch (e) {
        console.error('XPath evaluation error:', e)
        return null
    }
}

export function useTextHighlighter(
    passageContainerRef: React.RefObject<HTMLDivElement>,
    testId: string,
    passageId: string
) {
    const [highlights, setHighlights] = useState<HighlightInfo[]>([])
    const [toolbarState, setToolbarState] = useState<
        | {
              top: number
              left: number
              mode: 'add'
              range: Range
          }
        | {
              top: number
              left: number
              mode: 'remove'
              highlightId: string
          }
        | null
    >(null)

    const STORAGE_KEY = `${STORAGE_KEY_PREFIX}${testId}_${passageId}`
    const domRef = passageContainerRef.current

    const clearHighlightSpans = useCallback(() => {
        const el = passageContainerRef.current
        if (!el) return
        el.querySelectorAll('span[data-highlight-id]').forEach((span) => {
            const parent = span.parentNode
            if (!parent) return
            while (span.firstChild) parent.insertBefore(span.firstChild, span)
            parent.removeChild(span)
            parent.normalize()
        })
    }, [passageContainerRef])

    const applyHighlights = useCallback(() => {
        const container = passageContainerRef.current
        if (!container || highlights.length === 0) return

        clearHighlightSpans()

        highlights.forEach((hl) => {
            const startNode = getNodeFromXPath(hl.startContainerPath, document)
            const endNode = getNodeFromXPath(hl.endContainerPath, document)
            if (!startNode || !endNode) return

            try {
                const r = document.createRange()
                r.setStart(startNode, hl.startOffset)
                r.setEnd(endNode, hl.endOffset)
                if (r.collapsed) return

                const span = document.createElement('span')
                span.dataset.highlightId = hl.id
                span.dataset.color = hl.color
                span.className = 'highlight'

                const frag = r.extractContents()
                span.appendChild(frag)
                r.insertNode(span)
            } catch (e) {
                console.warn('Could not apply highlight:', hl.id, e)
            }
        })
    }, [highlights, clearHighlightSpans, passageContainerRef])

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                setHighlights(JSON.parse(stored))
            } catch (e) {
                localStorage.removeItem(STORAGE_KEY)
            }
        }
    }, [STORAGE_KEY])

    useEffect(() => {
        if (domRef) {
            applyHighlights()
        }
    }, [highlights, domRef, applyHighlights])

    const handleMouseUp = useCallback(
        (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const selection = window.getSelection()

            const clickedSpan = target.closest('span[data-highlight-id]')
            if (clickedSpan && (!selection || selection.isCollapsed)) {
                const id = (clickedSpan as HTMLElement).dataset.highlightId!
                const rect = clickedSpan.getBoundingClientRect()
                setToolbarState({
                    top: rect.top + window.scrollY - 40,
                    left: rect.left + window.scrollX + rect.width / 2,
                    mode: 'remove',
                    highlightId: id,
                })
                selection?.removeAllRanges()
                return
            }

            if (
                selection &&
                !selection.isCollapsed &&
                selection.rangeCount > 0
            ) {
                const range = selection.getRangeAt(0)
                if (domRef?.contains(range.commonAncestorContainer)) {
                    if (
                        range.startContainer.parentElement?.closest(
                            'span[data-highlight-id]'
                        ) ||
                        range.endContainer.parentElement?.closest(
                            'span[data-highlight-id]'
                        )
                    ) {
                        setToolbarState(null)
                        selection.removeAllRanges()
                        return
                    }

                    const rect = range.getBoundingClientRect()
                    setToolbarState({
                        top: rect.top + window.scrollY - 40,
                        left: rect.left + window.scrollX + rect.width / 2,
                        mode: 'add',
                        range: range.cloneRange(),
                    })
                } else {
                    setToolbarState(null)
                }
            } else {
                setToolbarState(null)
            }
        },
        [domRef]
    )

    const addHighlight = useCallback(
        (color: string) => {
            if (!toolbarState || toolbarState.mode !== 'add') return

            const { range } = toolbarState
            const selectionText = range.toString().trim()
            if (!selectionText) return

            const newHighlight: HighlightInfo = {
                id: `hl-${Date.now()}`,
                text: selectionText,
                startContainerPath: getXPathForNode(range.startContainer),
                startOffset: range.startOffset,
                endContainerPath: getXPathForNode(range.endContainer),
                endOffset: range.endOffset,
                color,
            }
            setHighlights((prev) => {
                const updated = [...prev, newHighlight]
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
                return updated
            })
            setToolbarState(null)
            window.getSelection()?.removeAllRanges()
        },
        [toolbarState, STORAGE_KEY]
    )

    const removeHighlight = useCallback(
        (id: string) => {
            setHighlights((prev) => {
                const updated = prev.filter((h) => h.id !== id)
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
                return updated
            })
            setToolbarState(null)
        },
        [STORAGE_KEY]
    )

    const clearAllHighlights = useCallback(() => {
        clearHighlightSpans()
        setHighlights([])
        localStorage.removeItem(STORAGE_KEY)
    }, [clearHighlightSpans, STORAGE_KEY])

    useEffect(() => {
        if (domRef) {
            domRef.addEventListener('mouseup', handleMouseUp)
            return () => {
                domRef.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [domRef, handleMouseUp])

    useEffect(() => {
        const el = passageContainerRef.current
        if (!el) return
        const onUp = (e: MouseEvent) => handleMouseUp(e)
        el.addEventListener('mouseup', onUp)
        return () => el.removeEventListener('mouseup', onUp)
    }, [passageContainerRef, handleMouseUp])

    return { toolbarState, addHighlight, removeHighlight, clearAllHighlights }
}
