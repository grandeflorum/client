export interface TreeNodeInterface {
  id: number;
  name: string;
  code: string;
  level: number;
  parentId: number;
  expand: boolean;
  menuLevel: number;
  menuOrder: number;
  children?: TreeNodeInterface[];
}