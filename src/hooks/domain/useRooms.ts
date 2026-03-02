import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import { listRooms, deleteRoom, type ListRoomsParams } from '@/lib/rooms'

// 1. Hook lấy danh sách
export const useRooms = (params: ListRoomsParams) => {
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
