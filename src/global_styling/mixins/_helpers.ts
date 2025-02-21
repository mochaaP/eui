/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import chroma from 'chroma-js';
import { useEuiTheme } from '../../services/theme/hooks';
import { transparentize } from '../../services/color';
import { useOverflowShadow } from './_shadow';
import { CSSProperties } from 'react';

/**
 * Set scroll bar appearance on Chrome (and firefox).
 * All parameters are optional and default to specific global settings.
 */
export const useScrollBar = ({
  thumbColor: _thumbColor,
  trackColor = 'transparent',
  width = 'thin',
  size: _size,
  corner: _corner,
}: {
  thumbColor?: CSSProperties['backgroundColor'];
  trackColor?: CSSProperties['backgroundColor'];
  /**
   * Defaults to `thin`. Use `auto` only for large page scrollbars
   */
  width?: CSSProperties['scrollbarWidth'];
  /**
   * Overall width (height for horizontal scrollbars)
   */
  size?: CSSProperties['width'];
  /**
   * Corner sizes are usually determined by `width` and
   * are used as an inset border and therefore a smaller corner size means a larger thumb
   */
  corner?: CSSProperties['borderWidth'];
} = {}) => {
  const {
    euiTheme: { colors, size },
  } = useEuiTheme();

  // Set defaults from theme
  const thumbColor = _thumbColor || transparentize(colors.darkShade, 0.5);
  const scrollBarSize = _size || size.base;
  const scrollBarCorner =
    _corner || width === 'thin' ? `calc(${size.s} * 0.75)` : size.xs;

  // Firefox's scrollbar coloring cascades, but the sizing does not,
  // so it's being added to this mixin for allowing support wherever custom scrollbars are
  const firefoxSupport = `scrollbar-color: ${thumbColor} ${trackColor};`;

  return `scrollbar-width: ${width};

    &::-webkit-scrollbar {
      width: ${scrollBarSize};
      height: ${scrollBarSize};
    }

    &::-webkit-scrollbar-thumb {
      background-color: ${thumbColor};
      background-clip: content-box;
      border-radius: ${scrollBarSize};
      border: ${scrollBarCorner} solid ${trackColor};
    }

    &::-webkit-scrollbar-corner,
    &::-webkit-scrollbar-track {
      background-color: ${trackColor};
    }

    ${firefoxSupport}
  `;
};

/**
 * NOTE: The ones below this comment were quick conversions of their Sass counterparts.
 *       They have yet to be used/tested.
 */

// Useful border shade when dealing with images of unknown color.
export const useInnerBorder = ({
  type = 'dark',
  borderRadius = 0,
  alpha = 0.1,
}: {
  type?: 'light' | 'dark';
  borderRadius?: number;
  alpha?: number;
}) => {
  const {
    euiTheme: { colors },
  } = useEuiTheme();
  const color = chroma(
    type === 'dark' ? colors.darkestShade : colors.emptyShade
  )
    .alpha(alpha)
    .css();

  return `
    position: relative;

    &:after {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: ${borderRadius};
      content: '';
      pointer-events: none;
      border: 1px solid ${color};
    }
  `;
};

/**
 * 1. Focus rings shouldn't be visible on scrollable regions, but a11y requires them to be focusable.
 *    Browser's supporting `:focus-visible` will still show outline on keyboard focus only.
 *    Others like Safari, won't show anything at all.
 */

// Just overflow and scrollbars
export const useYScroll = () => `
  ${useScrollBar()}
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  &:focus {
    outline: none; /* 1 */
  }
`;
export const useXScroll = () => `
  ${useScrollBar()}
  overflow-x: auto;

  &:focus {
    outline: none; /* 1 */
  }
`;

// // The full overflow with shadow
export const useYScrollWithShadows = () => `
  ${useYScroll()}
  ${useOverflowShadow({ direction: 'y' })}
`;

export const useXScrollWithShadows = () => `
  ${useXScroll()}
  ${useOverflowShadow({ direction: 'x' })}
`;

// Hiding elements offscreen to only be read by screen reader
export const useScreenReaderOnly = () => `
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

// Doesn't have reduced motion turned on
export const useCanAnimate = (content: string) => `
  @media screen and (prefers-reduced-motion: no-preference) {
    ${content}
  }
`;
