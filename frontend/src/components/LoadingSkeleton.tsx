import React from 'react'

export function PregnancyCardSkeleton() {
  return (
    <div className="bg-white rounded-rounded shadow-card p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-12 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
      </div>
    </div>
  )
}

export function ChatBoxSkeleton() {
  return (
    <div className="bg-white rounded-rounded shadow-card p-6 h-96 flex flex-col animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>

      {/* Messages placeholder */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        <div className="flex justify-start">
          <div className="h-10 bg-gray-200 rounded-lg w-2/3"></div>
        </div>
        <div className="flex justify-end">
          <div className="h-10 bg-gray-200 rounded-lg w-1/2"></div>
        </div>
        <div className="flex justify-start">
          <div className="h-10 bg-gray-200 rounded-lg w-3/5"></div>
        </div>
      </div>

      {/* Input placeholder */}
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
        <div className="w-20 h-10 bg-gray-300 rounded-lg"></div>
      </div>
    </div>
  )
}

export function VitalsFormSkeleton() {
  return (
    <div className="bg-white rounded-rounded shadow-card p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="grid md:grid-cols-5 gap-4">
        <div className="h-10 bg-gray-200 rounded-lg"></div>
        <div className="h-10 bg-gray-200 rounded-lg"></div>
        <div className="h-10 bg-gray-200 rounded-lg"></div>
        <div className="h-10 bg-gray-200 rounded-lg"></div>
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-lavender to-soft-mint">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <PregnancyCardSkeleton />
          <div className="md:col-span-2">
            <ChatBoxSkeleton />
          </div>
        </div>
        <VitalsFormSkeleton />
      </div>
    </div>
  )
}
