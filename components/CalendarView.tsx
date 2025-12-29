'use client'

import { useStore } from '@/store/useStore'
import { useState, useMemo } from 'react'
import { DndContext, DragEndEvent, DragStartEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
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
  endOfWeek
} from 'date-fns'

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
      className={`group relative p-2 mb-2 rounded-lg border text-xs transition-all hover:scale-[1.02] ${statusColors[post.status]} ${isDragging ? 'z-50' : ''}`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span>{statusIcons[post.status]}</span>
            <span className="text-white font-medium truncate">{post.topic}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {post.platforms.map((platform: string) => (
              <span key={platform} className="px-1.5 py-0.5 bg-slate-700/50 rounded text-[10px] text-slate-400">
                {platform === 'x' ? '𝕏' : platform === 'linkedin' ? '💼' : '📝'}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(post.id)
          }}
          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
        >
          ×
        </button>
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
      className={`min-h-[120px] p-2 rounded-lg border transition-all ${
        isOver
          ? 'bg-violet-600/20 border-violet-400/60 shadow-xl shadow-violet-500/30 scale-[1.02]'
          : isTodayDate
          ? 'bg-violet-500/10 border-violet-500/40 shadow-lg shadow-violet-500/20'
          : isCurrentMonth
          ? 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50'
          : 'bg-slate-900/20 border-slate-800/30'
      }`}
    >
      {/* Date number */}
      <div className={`text-sm font-medium mb-2 ${
        isTodayDate
          ? 'text-violet-400'
          : isCurrentMonth
          ? 'text-slate-300'
          : 'text-slate-600'
      }`}>
        {format(date, 'd')}
        {isTodayDate && (
          <span className="ml-1 text-[10px] text-violet-400">Today</span>
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
        <div className="flex items-center justify-center h-16 text-violet-400 text-xs">
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
      const dateKey = format(new Date(post.scheduledDate), 'yyyy-MM-dd')
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(post)
    })
    return grouped
  }, [scheduledPosts])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const postId = active.id as string
      const newDate = over.id as string

      // Update the post's scheduled date
      updateScheduledPost(postId, { scheduledDate: newDate })
    }

    setActiveId(null)
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
    <div className="max-w-7xl mx-auto animate-slide-up">
      <div className="card-glass p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Content Calendar
            </h1>
            <p className="text-slate-400">
              Drag and drop posts to schedule them
            </p>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-violet-500/40 text-slate-300 hover:text-white transition-all"
            >
              ←
            </button>
            <div className="text-center min-w-[180px]">
              <div className="text-xl font-bold text-white">
                {format(currentMonth, 'MMMM yyyy')}
              </div>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-violet-500/40 text-slate-300 hover:text-white transition-all"
            >
              →
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/30 hover:border-violet-500/60 text-violet-300 hover:text-violet-200 font-medium transition-all"
            >
              Today
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            <span className="text-sm text-slate-400">Draft</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏰</span>
            <span className="text-sm text-slate-400">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <span className="text-sm text-slate-400">Published</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-bold text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
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
        </DndContext>

        {/* Schedule from History */}
        {history.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>📋</span>
              Schedule from History
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleScheduleFromHistory(item)}
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-violet-500/40 text-left transition-all hover:scale-[1.02]"
                >
                  <div className="text-sm font-medium text-white mb-2 truncate">
                    {item.topic}
                  </div>
                  <div className="text-xs text-slate-400">
                    {format(new Date(item.createdAt), 'MMM d, yyyy')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
