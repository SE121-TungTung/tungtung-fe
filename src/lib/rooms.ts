import { api } from '@/lib/api'

export type RoomType =
    | 'classroom'
    | 'computer_lab'
    | 'meeting_room'
    | 'auditorium'
    | 'library'
export type RoomStatus =
    | 'available'
    | 'maintenance'
    | 'unavailable'
    | 'reserved'

export type Equipment = Record<string, any> | null

export type EquipmentItem = {
    name: string
    quantity?: number
    status?: string // "working" | "broken" | ...
}

export type BackendRoom = {
    id: string
    name: string
    capacity: number
    location?: string | null
    equipment?: Equipment
    room_type: RoomType
    status: RoomStatus
    notes?: string | null
    created_at: string
    updated_at: string
}

export type Room = {
    id: string
    name: string
    capacity: number
    location?: string | null
    equipment: Equipment
    roomType: RoomType
    status: RoomStatus
    notes?: string | null
    createdAt: string
    updatedAt: string
    deletedAt: string | null
}

function mapRoom(b: any): Room {
    return {
        id: b.id,
        name: b.name,
        capacity: b.capacity ?? 0,
        location: b.location ?? '',
        equipment: b.equipment ?? {},
        roomType: b.room_type ?? 'classroom',
        status: b.status ?? 'available',
        notes: b.notes ?? '',
        createdAt: b.created_at,
        updatedAt: b.updated_at,
        deletedAt: b.deleted_at ?? null,
    }
}

export type ListRoomsParams = {
    search?: string
    status?: RoomStatus | ''
    roomType?: RoomType | ''
    minCapacity?: number | ''
    maxCapacity?: number | ''
    page?: number
    limit?: number
    sortBy?: 'name' | 'capacity' | 'created_at'
    sortDir?: 'asc' | 'desc'
}

export type ListRoomsResp = {
    items: Room[]
    total: number
    page: number
    size: number
    pages: number
    raw?: BackendRoom[]
}

export async function listRooms(
    p: ListRoomsParams & { includeDeleted?: boolean } = {}
) {
    const {
        search = '',
        page = 1,
        limit = 10,
        sortBy,
        sortDir,
        status,
        roomType,
        minCapacity,
    } = p

    const qs = new URLSearchParams()
    qs.set('skip', '0')
    qs.set('limit', '1000')
    if (search) qs.set('search', search)

    const url = `/api/v1/rooms/${qs.toString() ? `?${qs.toString()}` : ''}`
    const res = await api<any>(url, { method: 'GET' })

    const raw = res.items ?? res.rooms ?? (Array.isArray(res) ? res : [])
    let items = raw.map(mapRoom)

    if (status) {
        items = items.filter((r: Room) => r.status === status)
    }
    if (roomType) {
        items = items.filter((r: Room) => r.roomType === roomType)
    }
    if (minCapacity) {
        items = items.filter((r: Room) => r.capacity >= Number(minCapacity))
    }

    if (sortBy) {
        items.sort((a: any, b: any) => {
            const valA = a[sortBy === 'created_at' ? 'createdAt' : sortBy]
            const valB = b[sortBy === 'created_at' ? 'createdAt' : sortBy]
            if (sortDir === 'asc') return valA > valB ? 1 : -1
            return valA < valB ? 1 : -1
        })
    }

    const total = items.length
    const startIndex = (page - 1) * limit
    const paginatedItems = items.slice(startIndex, startIndex + limit)

    return {
        items: paginatedItems,
        total: total,
        page: page,
        size: limit,
        pages: Math.ceil(total / limit),
    }
}

export type CreateRoomDto = {
    name: string
    capacity: number
    location?: string | null
    equipment?: Equipment
    room_type: RoomType
    status?: RoomStatus
    notes?: string | null
}

export async function createRoom(body: CreateRoomDto): Promise<Room> {
    const res = await api<BackendRoom>('/api/v1/rooms/', {
        method: 'POST',
        body: JSON.stringify(body),
    })
    return mapRoom(res)
}

export type UpdateRoomDto = Partial<CreateRoomDto>

export async function updateRoom(
    id: string,
    body: UpdateRoomDto
): Promise<Room> {
    const res = await api<BackendRoom>(`/api/v1/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
    })
    return mapRoom(res)
}

export async function deleteRoom(id: string): Promise<void> {
    await api<void>(`/api/v1/rooms/${id}`, { method: 'DELETE' })
}

export async function getRoom(id: string): Promise<Room> {
    const res = await api<BackendRoom>(`/api/v1/rooms/${id}`, { method: 'GET' })
    return mapRoom(res)
}
