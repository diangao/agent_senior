'use client';

import React from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface ProcessFlowProps {
  currentStep?: string;
}

const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'input',
    data: { label: '开始对话' },
    position: { x: 250, y: 0 },
  },
  {
    id: 'voice',
    data: { label: '语音输入' },
    position: { x: 250, y: 100 },
  },
  {
    id: 'process',
    data: { label: '处理请求' },
    position: { x: 250, y: 200 },
  },
  {
    id: 'automation',
    data: { label: '自动化执行' },
    position: { x: 250, y: 300 },
  },
  {
    id: 'complete',
    type: 'output',
    data: { label: '完成' },
    position: { x: 250, y: 400 },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1',
    source: 'start',
    target: 'voice',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e2',
    source: 'voice',
    target: 'process',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e3',
    source: 'process',
    target: 'automation',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e4',
    source: 'automation',
    target: 'complete',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];

export const ProcessFlow: React.FC<ProcessFlowProps> = ({ currentStep }) => {
  const nodes = React.useMemo(() => {
    return initialNodes.map(node => ({
      ...node,
      className: node.id === currentStep ? 'bg-blue-200' : '',
    }));
  }, [currentStep]);

  return (
    <div className="h-96">
      <ReactFlow
        nodes={nodes}
        edges={initialEdges}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};