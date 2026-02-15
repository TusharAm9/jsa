import React from 'react';

export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}></div>
    );
}

export function UserListItemSkeleton() {
    return (
        <div className="w-full p-3 rounded-lg bg-gray-50 flex flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-1/4 mt-1" />
        </div>
    );
}

export function UserDetailSkeleton() {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border-t-4 border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <div className="space-y-2 w-full">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                </div>

                <Skeleton className="h-24 w-full mb-6" />
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                </div>
                <div className="grid grid-cols-4 gap-3">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
                <Skeleton className="h-6 w-1/4 mb-4" />
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    );
}
