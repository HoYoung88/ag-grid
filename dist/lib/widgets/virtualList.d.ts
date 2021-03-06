import { Component } from './component';
import { ManagedFocusComponent } from './managedFocusComponent';
export interface VirtualListModel {
    getRowCount(): number;
    getRow(index: number): any;
    isRowSelected?(index: number): boolean;
}
export declare class VirtualList extends ManagedFocusComponent {
    private readonly cssIdentifier;
    private model;
    private renderedRows;
    private componentCreator;
    private rowHeight;
    private lastFocusedRowIndex;
    private isDestroyed;
    private readonly gridOptionsWrapper;
    private readonly eContainer;
    constructor(cssIdentifier?: string);
    protected postConstruct(): void;
    protected focusInnerElement(fromBottom: boolean): void;
    protected onFocusIn(e: FocusEvent): void;
    protected onFocusOut(e: FocusEvent): void;
    protected handleKeyDown(e: KeyboardEvent): void;
    protected onTabKeyDown(e: KeyboardEvent): void;
    private navigate;
    getLastFocusedRow(): number;
    focusRow(rowNumber: number): void;
    getComponentAt(rowIndex: number): Component;
    private static getTemplate;
    private getItemHeight;
    ensureIndexVisible(index: number): void;
    setComponentCreator(componentCreator: (value: any) => Component): void;
    getRowHeight(): number;
    getScrollTop(): number;
    setRowHeight(rowHeight: number): void;
    refresh(): void;
    private clearVirtualRows;
    private drawVirtualRows;
    private ensureRowsRendered;
    private insertRow;
    private removeRow;
    private addScrollListener;
    setModel(model: VirtualListModel): void;
    destroy(): void;
}
