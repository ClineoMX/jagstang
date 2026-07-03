import React, { useMemo } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';

export interface StreamingMarkdownProps {
  text: string;
  isStreaming?: boolean;
  fontSize?: string;
}

const StreamingMarkdown: React.FC<StreamingMarkdownProps> = ({
  text,
  isStreaming = false,
  fontSize = '13px',
}) => {
  const labelColor = useColorModeValue('paper.600', 'paper.400');
  const inkStrong = useColorModeValue('paper.900', 'paper.50');
  const codeBg = useColorModeValue('paper.100', 'paper.700');

  // Truco para evitar que el último parrafo "salte" al cambiar de bloque:
  // si está streameando y termina con texto en una línea, podemos confiar en
  // que ReactMarkdown re-renderice ya que `text` cambia cada frame.
  const content = useMemo(() => text, [text]);

  return (
    <Box
      color={inkStrong}
      fontSize={fontSize}
      lineHeight="1.65"
      sx={{
        // Caret parpadeante al final del último bloque en stream.
        '&[data-streaming="true"] > :last-child::after': {
          content: '""',
          display: 'inline-block',
          width: '6px',
          height: '1em',
          background: 'currentColor',
          opacity: 0.6,
          transform: 'translateY(2px)',
          marginLeft: '2px',
          borderRadius: '1px',
          animation: 'sm-blink 1s steps(1) infinite',
        },
        '@keyframes sm-blink': {
          '50%': { opacity: 0 },
        },
        '& h1': {
          fontSize: '17px',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          mt: 4,
          mb: 2,
          _first: { mt: 0 },
        },
        '& h2': {
          fontSize: '15px',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          mt: 4,
          mb: 2,
          _first: { mt: 0 },
        },
        '& h3': {
          fontFamily: 'mono',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: labelColor,
          mt: 4,
          mb: 1.5,
          _first: { mt: 0 },
        },
        '& p': { mb: 2 },
        '& ul, & ol': { ml: 5, mb: 2 },
        '& li': { mb: 0.5 },
        '& strong': { fontWeight: 600 },
        '& em': { fontStyle: 'italic' },
        '& a': { color: 'brand.600', textDecoration: 'underline' },
        '& blockquote': {
          borderLeft: '3px solid',
          borderColor: 'line.strong',
          pl: 3,
          color: labelColor,
          my: 3,
        },
        '& code': {
          fontFamily: 'mono',
          bg: codeBg,
          px: 1,
          py: 0.5,
          borderRadius: '4px',
          fontSize: '0.92em',
        },
        '& pre': {
          fontFamily: 'mono',
          bg: codeBg,
          p: 3,
          borderRadius: '6px',
          overflowX: 'auto',
          mb: 3,
        },
        '& pre code': { bg: 'transparent', p: 0 },
        '& hr': { borderColor: 'line.light', my: 4 },
        '& table': {
          width: 'full',
          borderCollapse: 'collapse',
          mb: 3,
          fontSize: '0.95em',
        },
        '& th, & td': {
          border: '1px solid',
          borderColor: 'line.light',
          px: 2,
          py: 1,
          textAlign: 'left',
        },
        '& th': { bg: codeBg, fontWeight: 600 },
      }}
      data-streaming={isStreaming ? 'true' : 'false'}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </Box>
  );
};

export default StreamingMarkdown;
