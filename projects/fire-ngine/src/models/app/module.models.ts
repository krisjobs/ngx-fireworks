import { ConfigParams, IconConfig } from '..';


export interface ModuleConfigParams extends ConfigParams {
  test: string;
}

export interface ModuleConfig {
  /**
   * unique url path segment
   */
  urlSegment: string;

  /**
   * display name in navmenu and header
   */
  displayName: string;

  /**
   * icon associated with module, used in navmenu and navbar
   */
  icon?: IconConfig;

  /**
   * disable nav link
   */
  disabled?: boolean;

  /**
   * module nav link hidden from header
   */
  hiddenFromHeader?: (params: Partial<ModuleConfigParams>) => boolean;

  /**
   * module nav link hidden from sidenav
   */
  hiddenFromSidenav?: (params: Partial<ModuleConfigParams>) => boolean;

  /**
   * show sidenav with links
   */
  showSidenav?: boolean;

  /**
   * section ids in a particular order
   */
  sectionIds: string[];
}
