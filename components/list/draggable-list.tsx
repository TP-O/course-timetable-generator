import { ListItem } from '@/types/component'
import * as React from 'react'
import { DragDropContext, Droppable, OnDragEndResponder } from 'react-beautiful-dnd'
import DraggableListItem from './draggable-list-item'

export type DraggableListProps = {
  items: ListItem[]
  onDragEnd: OnDragEndResponder
}

export function DraggableList({ items, onDragEnd }: DraggableListProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable-list">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {items.map((item, index) => (
              <DraggableListItem item={item} key={index} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default DraggableList
