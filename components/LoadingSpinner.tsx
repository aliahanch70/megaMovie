import { Flex, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center p-4 w-full">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
    </div>
  );
}

// import React from 'react';
// import { LoadingOutlined } from '@ant-design/icons';
// import { Flex, Spin } from 'antd';

// const App: React.FC = () => (
//   <Flex align="center" gap="middle">
//     <Spin indicator={<LoadingOutlined spin />} size="small" />
//     <Spin indicator={<LoadingOutlined spin />} />
//     <Spin indicator={<LoadingOutlined spin />} size="large" />
//     <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
//   </Flex>
// );

// export default App;