import { Handle, Position } from 'react-flow-renderer';

const CoreferenceNode = ({ data }: { data: any }) => {
  return (
    <div style={{ ...data.style }}>
      {data.label}
      <Handle type="target" position={Position.Top} />
      {/* <Handle
        type={'source'}
        position={Position.Left}
        id="b"
        style={handleStyle}
      /> */}
      <Handle type={'target'} position={Position.Right} id="c" />
      <Handle type="source" position={Position.Bottom} id="a" />
    </div>
  );
};

export default CoreferenceNode;
