import React from 'react';
import { Box } from '@chakra-ui/react';

interface ClineoLogoProps {
  size?: number | string;
  color?: string;
}

const ClineoLogo: React.FC<ClineoLogoProps> = ({
  size = 64,
  color = '#0062CC'
}) => {
  return (
    <Box
      as="svg"
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main C shape */}
      <path
        d="M 140 45 Q 165 65, 165 100 Q 165 135, 140 155"
        stroke={color}
        strokeWidth="30"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 140 50 A 60 60 0 0 0 65 110"
        stroke={color}
        strokeWidth="30"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 65 110 A 50 50 0 0 0 140 150"
        stroke={color}
        strokeWidth="30"
        strokeLinecap="round"
        fill="none"
      />
    </Box>
  );
};

export default ClineoLogo;
