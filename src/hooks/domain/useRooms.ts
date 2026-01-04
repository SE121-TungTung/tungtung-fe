import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import {
    listRooms,
    deleteRoom,
    type RoomType,
    type RoomStatus,
} from '@/lib/rooms'

export interface RoomListParams {
    page?: number
    limit?: number
    search?: string
    sortBy?: 'name' | 'capacity' | 'created_at'
    sortOrder?: 'asc' | 'desc'
    roomType?: RoomType | ''
    status?: RoomStatus | ''
    capacity?: number | ''
    includeDeleted?: boolean
}

// 1. Hook lấy danh sách
export const useRooms = (params: RoomListParams) => {
    return useQuery({
        queryKey: ['rooms', params],
        queryFn: () => listRooms(params),
        placeholderData: keepPreviousData,
    })
}

// 2. Hook xóa
export const useDeleteRoom = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteRoom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] })
        },
    })
}
