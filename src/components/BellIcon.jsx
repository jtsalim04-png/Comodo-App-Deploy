import Svg, { Path } from 'react-native-svg';

import theme from '../utils/theme';

/**
 * Simple bell glyph in Comodo butterscotch (matches web / app accent).
 */
const BellIcon = ({ size = 20, color = theme.colors.butterscotch }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2.5c-2.8 0-5 2.2-5 5v2.6c0 .8-.3 1.6-.8 2.2L4.8 17.5h14.4l-1.4-5.2c-.5-.6-.8-1.4-.8-2.2V7.5c0-2.8-2.2-5-5-5z"
      fill={color}
    />
    <Path
      d="M9.5 17.5c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

export default BellIcon;
