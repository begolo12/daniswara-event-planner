import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical, Clock, User } from 'lucide-react';

export default function RundownDragDrop({ items = [], onUpdateOrder }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    if (onUpdateOrder) {
      onUpdateOrder(reordered);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="rundown">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50"
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                {(dragProvided, snapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors
                      ${snapshot.isDragging ? 'bg-brand-50 shadow-lg' : 'hover:bg-gray-50'}`}
                  >
                    <div
                      {...dragProvided.dragHandleProps}
                      className="p-1 rounded cursor-grab text-dark-300 hover:text-dark-500"
                    >
                      <GripVertical size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="flex items-center gap-1 text-xs text-dark-500">
                          <Clock size={12} />
                          <span>{item.startTime} - {item.endTime}</span>
                        </div>
                      </div>
                      <p className="font-medium text-dark-900 truncate">{item.agenda}</p>
                      {item.pic && (
                        <div className="flex items-center gap-1 text-xs text-dark-400 mt-0.5">
                          <User size={10} />
                          <span>{item.pic}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-dark-400 font-mono">
                      #{index + 1}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {items.length === 0 && (
              <div className="text-center py-12 text-dark-500 text-sm">
                Seret item ke sini untuk mengatur urutan
              </div>
            )}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
