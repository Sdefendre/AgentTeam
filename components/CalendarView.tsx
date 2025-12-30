'use client'

import { useStore } from '@/store/useStore'
import { useState, useMemo } from 'react'
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, useDraggable, useDroppable, rectIntersection } from '@dnd-kit/core'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isValid,
  parseISO
} from 'date-fns'

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const getDateKey = (value?: string | null) => {
  if (!value) return null
  if (DATE_KEY_PATTERN.test(value)) return value
  const parsed = parseISO(value)
  return isValid(parsed) ? format(parsed, 'yyyy-MM-dd') : null
}

interface DraggablePostProps {
  post: any
  onDelete: (id: string) => void
}

function DraggablePost({ post, onDelete }: DraggablePostProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: post.id,
    data: { post }
  })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  const statusColors = {
    draft: 'border-slate-600 bg-slate-800/50',
    scheduled: 'border-violet-500/40 bg-violet-500/10',
    published: 'border-green-500/40 bg-green-500/10'
  }

  const statusIcons = {
    draft: '📝',
    scheduled: '⏰',
    published: '✅'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative p-1.5 mb-1 rounded border text-[10px] transition-all hover:scale-[1.02] ${statusColors[post.status]} ${isDragging ? 'z-50' : ''}`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-0.5">
            <span className="text-xs">{statusIcons[post.status]}</span>
            <span className="text-white font-medium truncate text-[10px]">{post.topic}</span>
          </div>
        </div>
        <button
          type="button"
          onPointerDown={(e) => {
            // Prevent drag sensor from hijacking the click (especially on touch)
            e.stopPropagation()
          }}
          onClick={(e) => {
            e.stopPropagation()
            onDelete(post.id)
          }}
          className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity text-xs"
          aria-label="Delete scheduled post"
        >
          ×
        </button>
      </div>
    </div>
  )
}

interface DraggableHistoryItemProps {
  item: any
}

function DraggableHistoryItem({ item }: DraggableHistoryItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `history-${item.id}`,
    data: { historyItem: item }
  })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex-shrink-0 w-48 p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-violet-500/40 text-left transition-all hover:scale-[1.02] ${isDragging ? 'z-50' : ''}`}
    >
      <div className="text-xs font-medium text-white mb-1 truncate">
        {item.topic}
      </div>
      <div className="text-[10px] text-slate-400">
        {format(new Date(item.createdAt), 'MMM d')}
      </div>
    </div>
  )
}

interface DroppableDayProps {
  date: Date
  posts: any[]
  onDelete: (id: string) => void
  currentMonth: Date
}

function DroppableDay({ date, posts, onDelete, currentMonth }: DroppableDayProps) {
  const dateKey = format(date, 'yyyy-MM-dd')
  const { setNodeRef, isOver } = useDroppable({
    id: dateKey,
    data: { date: dateKey }
  })

  const isCurrentMonth = isSameMonth(date, currentMonth)
  const isTodayDate = isToday(date)

  return (
    <div
      ref={setNodeRef}
      className={`relative w-full h-full min-h-[90px] p-1.5 rounded-lg border transition-all ${
        isOver
          ? 'bg-violet-600/30 border-violet-400 shadow-xl shadow-violet-500/40'
          : isTodayDate
          ? 'bg-violet-500/10 border-violet-500/40 shadow-lg shadow-violet-500/20'
          : isCurrentMonth
          ? 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50'
          : 'bg-slate-900/20 border-slate-800/30'
      }`}
    >
      {/* Date number */}
      <div className={`text-xs font-medium mb-1 ${
        isTodayDate
          ? 'text-violet-400'
          : isCurrentMonth
          ? 'text-slate-300'
          : 'text-slate-600'
      }`}>
        {format(date, 'd')}
        {isTodayDate && (
          <span className="ml-1 text-[9px] text-violet-400">Today</span>
        )}
      </div>

      {/* Scheduled posts */}
      <div className="space-y-1">
        {posts.map((post) => (
          <DraggablePost key={post.id} post={post} onDelete={onDelete} />
        ))}
      </div>

      {/* Drop zone indicator */}
      {isOver && posts.length === 0 && (
        <div className="flex items-center justify-center h-12 text-violet-400 text-[10px]">
          Drop here
        </div>
      )}
    </div>
  )
}

export default function CalendarView() {
  const { scheduledPosts, updateScheduledPost, deleteScheduledPost, history, addScheduledPost } = useStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<any>(null)

  // Get calendar days (including padding days from prev/next month)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  // Group posts by date
  const postsByDate = useMemo(() => {
    const grouped: { [key: string]: any[] } = {}
    scheduledPosts.forEach(post => {
      const dateKey = getDateKey(post.scheduledDate)
      if (!dateKey) return
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(post)
    })
    return grouped
  }, [scheduledPosts])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    const activeData = event.active.data.current

    // Set active item for ghost preview
    if (activeData?.historyItem) {
      setActiveItem({ type: 'history', data: activeData.historyItem })
    } else {
      const post = scheduledPosts.find(p => p.id === event.active.id)
      if (post) setActiveItem({ type: 'post', data: post })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over) {
      const activeData = active.data.current
      const newDate = getDateKey(String(over.id))

      if (newDate) {
        // Check if dragging from history
        if (activeData?.historyItem) {
          // Create new scheduled post from history item
          const newPost = {
            id: `scheduled-${Date.now()}`,
            topic: activeData.historyItem.topic,
            scheduledDate: newDate,
            status: 'draft' as const,
            platforms: ['x' as const, 'linkedin' as const],
            results: activeData.historyItem.results
          }
          addScheduledPost(newPost)
        } else {
          // Moving existing scheduled post
          const postId = active.id as string
          const existingPost = scheduledPosts.find(post => post.id === postId)
          const existingDate = existingPost ? getDateKey(existingPost.scheduledDate) : null
          if (existingDate !== newDate) {
            updateScheduledPost(postId, { scheduledDate: newDate })
          }
        }
      }
    }

    setActiveId(null)
    setActiveItem(null)
  }

  const handleScheduleFromHistory = (item: any) => {
    const newPost = {
      id: `scheduled-${Date.now()}`,
      topic: item.topic,
      scheduledDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'draft' as const,
      platforms: ['x' as const, 'linkedin' as const],
      results: item.results
    }
    addScheduledPost(newPost)
  }

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const handleToday = () => setCurrentMonth(new Date())

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="max-w-7xl mx-auto animate-slide-up h-full flex flex-col">
      <div className="card-glass p-4 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 flex-shrink-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Content Calendar
            </h1>
            <p className="text-xs text-slate-400">
              Drag and drop posts to schedule
            </p>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-violet-500/40 text-slate-300 hover:text-white transition-all text-sm"
            >
              ←
            </button>
            <div className="text-center min-w-[140px]">
              <div className="text-base font-bold text-white">
                {format(currentMonth, 'MMMM yyyy')}
              </div>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-violet-500/40 text-slate-300 hover:text-white transition-all text-sm"
            >
              →
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/30 hover:border-violet-500/60 text-violet-300 hover:text-violet-200 text-xs font-medium transition-all"
            >
              Today
            </button>
          </div>
        </div>

        {/* Legend - Compact */}
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-700/50 text-xs flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base">📝</span>
            <span className="text-slate-400">Draft</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">⏰</span>
            <span className="text-slate-400">Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">✅</span>
            <span className="text-slate-400">Published</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-violet-400">📋 Drag from history below ↓</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={rectIntersection}
        >
          <div className="flex-1 flex flex-col min-h-0">
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1 flex-shrink-0">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-[10px] font-bold text-slate-400 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 auto-rows-fr gap-1 flex-1">
              {calendarDays.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd')
                const dayPosts = postsByDate[dateKey] || []

                return (
                  <DroppableDay
                    key={dateKey}
                    date={day}
                    posts={dayPosts}
                    onDelete={deleteScheduledPost}
                    currentMonth={currentMonth}
                  />
                )
              })}
            </div>
          </div>

          {/* Schedule from History - Horizontal Scroll */}
          {history.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-700/50 flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-400">📋 HISTORY</span>
                <span className="text-[10px] text-violet-400">← Scroll & drag to calendar</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {history.slice(0, 12).map((item) => (
                  <DraggableHistoryItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Drag Overlay - Ghost Preview */}
          <DragOverlay dropAnimation={null}>
            {activeItem && (
              <div className="opacity-90 rotate-3 scale-105">
                {activeItem.type === 'post' ? (
                  <div className="p-1.5 rounded border border-violet-400 bg-violet-500/20 text-[10px] shadow-xl shadow-violet-500/50">
                    <div className="flex items-center gap-0.5">
                      <span className="text-xs">
                        {activeItem.data.status === 'draft' ? '📝' : activeItem.data.status === 'scheduled' ? '⏰' : '✅'}
                      </span>
                      <span className="text-white font-medium truncate text-[10px]">{activeItem.data.topic}</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-48 p-3 rounded-lg bg-violet-500/20 border border-violet-400 shadow-xl shadow-violet-500/50">
                    <div className="text-xs font-medium text-white mb-1 truncate">
                      {activeItem.data.topic}
                    </div>
                    <div className="text-[10px] text-slate-300">
                      {format(new Date(activeItem.data.createdAt), 'MMM d')}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
