import { ListItem as ListItemType } from '@/types/component'
import { Inbox } from '@mui/icons-material'
import { Avatar, ListItem, ListItemAvatar, ListItemText } from '@mui/material'
import { Draggable } from 'react-beautiful-dnd'

export type DraggableListItemProps = {
  index: number
  item: ListItemType
}

export function DraggableListItem({ index, item }: DraggableListItemProps) {
  return (
    <Draggable draggableId={String(index)} index={index}>
      {(provided) => (
        <ListItem
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <ListItemAvatar>
            <Avatar>
              <Inbox />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={item.primary} secondary={item.secondary} />
        </ListItem>
      )}
    </Draggable>
  )
}

export default DraggableListItem
