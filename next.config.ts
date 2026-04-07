import type { NextConfig } from 'next';
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {
allowedDevOrigins: ['127.0.0.1'],
};

export default withPayload(nextConfig);
