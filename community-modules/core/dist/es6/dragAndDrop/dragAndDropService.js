/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v22.1.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Qualifier, PostConstruct, Bean, Autowired, PreDestroy } from "../context/context";
import { _ } from "../utils";
export var DragSourceType;
(function (DragSourceType) {
    DragSourceType[DragSourceType["ToolPanel"] = 0] = "ToolPanel";
    DragSourceType[DragSourceType["HeaderCell"] = 1] = "HeaderCell";
    DragSourceType[DragSourceType["RowDrag"] = 2] = "RowDrag";
    DragSourceType[DragSourceType["ChartPanel"] = 3] = "ChartPanel";
})(DragSourceType || (DragSourceType = {}));
export var VerticalDirection;
(function (VerticalDirection) {
    VerticalDirection[VerticalDirection["Up"] = 0] = "Up";
    VerticalDirection[VerticalDirection["Down"] = 1] = "Down";
})(VerticalDirection || (VerticalDirection = {}));
export var HorizontalDirection;
(function (HorizontalDirection) {
    HorizontalDirection[HorizontalDirection["Left"] = 0] = "Left";
    HorizontalDirection[HorizontalDirection["Right"] = 1] = "Right";
})(HorizontalDirection || (HorizontalDirection = {}));
var DragAndDropService = /** @class */ (function () {
    function DragAndDropService() {
        this.dragSourceAndParamsList = [];
        this.dropTargets = [];
    }
    DragAndDropService_1 = DragAndDropService;
    DragAndDropService.prototype.init = function () {
        this.ePinnedIcon = _.createIcon('columnMovePin', this.gridOptionsWrapper, null);
        this.ePlusIcon = _.createIcon('columnMoveAdd', this.gridOptionsWrapper, null);
        this.eHiddenIcon = _.createIcon('columnMoveHide', this.gridOptionsWrapper, null);
        this.eMoveIcon = _.createIcon('columnMoveMove', this.gridOptionsWrapper, null);
        this.eLeftIcon = _.createIcon('columnMoveLeft', this.gridOptionsWrapper, null);
        this.eRightIcon = _.createIcon('columnMoveRight', this.gridOptionsWrapper, null);
        this.eGroupIcon = _.createIcon('columnMoveGroup', this.gridOptionsWrapper, null);
        this.eAggregateIcon = _.createIcon('columnMoveValue', this.gridOptionsWrapper, null);
        this.ePivotIcon = _.createIcon('columnMovePivot', this.gridOptionsWrapper, null);
        this.eDropNotAllowedIcon = _.createIcon('dropNotAllowed', this.gridOptionsWrapper, null);
    };
    DragAndDropService.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('OldToolPanelDragAndDropService');
    };
    DragAndDropService.prototype.addDragSource = function (dragSource, allowTouch) {
        if (allowTouch === void 0) { allowTouch = false; }
        var params = {
            eElement: dragSource.eElement,
            dragStartPixels: dragSource.dragStartPixels,
            onDragStart: this.onDragStart.bind(this, dragSource),
            onDragStop: this.onDragStop.bind(this),
            onDragging: this.onDragging.bind(this)
        };
        this.dragSourceAndParamsList.push({ params: params, dragSource: dragSource });
        this.dragService.addDragSource(params, allowTouch);
    };
    DragAndDropService.prototype.removeDragSource = function (dragSource) {
        var sourceAndParams = _.find(this.dragSourceAndParamsList, function (item) { return item.dragSource === dragSource; });
        if (sourceAndParams) {
            this.dragService.removeDragSource(sourceAndParams.params);
            _.removeFromArray(this.dragSourceAndParamsList, sourceAndParams);
        }
    };
    DragAndDropService.prototype.destroy = function () {
        var _this = this;
        this.dragSourceAndParamsList.forEach(function (sourceAndParams) { return _this.dragService.removeDragSource(sourceAndParams.params); });
        this.dragSourceAndParamsList.length = 0;
    };
    DragAndDropService.prototype.nudge = function () {
        if (this.dragging) {
            this.onDragging(this.eventLastTime, true);
        }
    };
    DragAndDropService.prototype.onDragStart = function (dragSource, mouseEvent) {
        this.dragging = true;
        this.dragSource = dragSource;
        this.eventLastTime = mouseEvent;
        this.dragItem = this.dragSource.getDragItem();
        this.lastDropTarget = this.dragSource.dragSourceDropTarget;
        if (this.dragSource.onDragStarted) {
            this.dragSource.onDragStarted();
        }
        this.createGhost();
    };
    DragAndDropService.prototype.onDragStop = function (mouseEvent) {
        this.eventLastTime = null;
        this.dragging = false;
        if (this.dragSource.onDragStopped) {
            this.dragSource.onDragStopped();
        }
        if (this.lastDropTarget && this.lastDropTarget.onDragStop) {
            var draggingEvent = this.createDropTargetEvent(this.lastDropTarget, mouseEvent, null, null, false);
            this.lastDropTarget.onDragStop(draggingEvent);
        }
        this.lastDropTarget = null;
        this.dragItem = null;
        this.removeGhost();
    };
    DragAndDropService.prototype.onDragging = function (mouseEvent, fromNudge) {
        var hDirection = this.getHorizontalDirection(mouseEvent);
        var vDirection = this.getVerticalDirection(mouseEvent);
        this.eventLastTime = mouseEvent;
        this.positionGhost(mouseEvent);
        // check if mouseEvent intersects with any of the drop targets
        var dropTarget = _.find(this.dropTargets, this.isMouseOnDropTarget.bind(this, mouseEvent));
        if (dropTarget !== this.lastDropTarget) {
            this.leaveLastTargetIfExists(mouseEvent, hDirection, vDirection, fromNudge);
            this.enterDragTargetIfExists(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            this.lastDropTarget = dropTarget;
        }
        else if (dropTarget) {
            var draggingEvent = this.createDropTargetEvent(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            dropTarget.onDragging(draggingEvent);
        }
    };
    DragAndDropService.prototype.enterDragTargetIfExists = function (dropTarget, mouseEvent, hDirection, vDirection, fromNudge) {
        if (!dropTarget) {
            return;
        }
        if (dropTarget.onDragEnter) {
            var dragEnterEvent = this.createDropTargetEvent(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            dropTarget.onDragEnter(dragEnterEvent);
        }
        this.setGhostIcon(dropTarget.getIconName ? dropTarget.getIconName() : null);
    };
    DragAndDropService.prototype.leaveLastTargetIfExists = function (mouseEvent, hDirection, vDirection, fromNudge) {
        if (!this.lastDropTarget) {
            return;
        }
        if (this.lastDropTarget.onDragLeave) {
            var dragLeaveEvent = this.createDropTargetEvent(this.lastDropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            this.lastDropTarget.onDragLeave(dragLeaveEvent);
        }
        this.setGhostIcon(null);
    };
    DragAndDropService.prototype.getAllContainersFromDropTarget = function (dropTarget) {
        var containers = [dropTarget.getContainer()];
        var secondaryContainers = dropTarget.getSecondaryContainers ? dropTarget.getSecondaryContainers() : null;
        if (secondaryContainers) {
            containers = containers.concat(secondaryContainers);
        }
        return containers;
    };
    // checks if the mouse is on the drop target. it checks eContainer and eSecondaryContainers
    DragAndDropService.prototype.isMouseOnDropTarget = function (mouseEvent, dropTarget) {
        var mouseOverTarget = false;
        this.getAllContainersFromDropTarget(dropTarget)
            .filter(function (eContainer) { return eContainer; }) // secondary can be missing
            .forEach(function (eContainer) {
            var rect = eContainer.getBoundingClientRect();
            // if element is not visible, then width and height are zero
            if (rect.width === 0 || rect.height === 0) {
                return;
            }
            var horizontalFit = mouseEvent.clientX >= rect.left && mouseEvent.clientX <= rect.right;
            var verticalFit = mouseEvent.clientY >= rect.top && mouseEvent.clientY <= rect.bottom;
            if (horizontalFit && verticalFit) {
                mouseOverTarget = true;
            }
        });
        return mouseOverTarget && dropTarget.isInterestedIn(this.dragSource.type);
    };
    DragAndDropService.prototype.addDropTarget = function (dropTarget) {
        this.dropTargets.push(dropTarget);
    };
    DragAndDropService.prototype.getHorizontalDirection = function (event) {
        if (this.eventLastTime.clientX > event.clientX) {
            return HorizontalDirection.Left;
        }
        else if (this.eventLastTime.clientX < event.clientX) {
            return HorizontalDirection.Right;
        }
        else {
            return null;
        }
    };
    DragAndDropService.prototype.getVerticalDirection = function (event) {
        if (this.eventLastTime.clientY > event.clientY) {
            return VerticalDirection.Up;
        }
        else if (this.eventLastTime.clientY < event.clientY) {
            return VerticalDirection.Down;
        }
        else {
            return null;
        }
    };
    DragAndDropService.prototype.createDropTargetEvent = function (dropTarget, event, hDirection, vDirection, fromNudge) {
        // localise x and y to the target component
        var rect = dropTarget.getContainer().getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        return {
            event: event,
            x: x,
            y: y,
            vDirection: vDirection,
            hDirection: hDirection,
            dragSource: this.dragSource,
            fromNudge: fromNudge,
            dragItem: this.dragItem
        };
    };
    DragAndDropService.prototype.positionGhost = function (event) {
        var ghostRect = this.eGhost.getBoundingClientRect();
        var ghostHeight = ghostRect.height;
        // for some reason, without the '-2', it still overlapped by 1 or 2 pixels, which
        // then brought in scrollbars to the browser. no idea why, but putting in -2 here
        // works around it which is good enough for me.
        var browserWidth = _.getBodyWidth() - 2;
        var browserHeight = _.getBodyHeight() - 2;
        // put ghost vertically in middle of cursor
        var top = event.pageY - (ghostHeight / 2);
        // horizontally, place cursor just right of icon
        var left = event.pageX - 30;
        var usrDocument = this.gridOptionsWrapper.getDocument();
        var windowScrollY = window.pageYOffset || usrDocument.documentElement.scrollTop;
        var windowScrollX = window.pageXOffset || usrDocument.documentElement.scrollLeft;
        // check ghost is not positioned outside of the browser
        if (browserWidth > 0 && ((left + this.eGhost.clientWidth) > (browserWidth + windowScrollX))) {
            left = browserWidth + windowScrollX - this.eGhost.clientWidth;
        }
        if (left < 0) {
            left = 0;
        }
        if (browserHeight > 0 && ((top + this.eGhost.clientHeight) > (browserHeight + windowScrollY))) {
            top = browserHeight + windowScrollY - this.eGhost.clientHeight;
        }
        if (top < 0) {
            top = 0;
        }
        this.eGhost.style.left = left + 'px';
        this.eGhost.style.top = top + 'px';
    };
    DragAndDropService.prototype.removeGhost = function () {
        if (this.eGhost && this.eGhostParent) {
            this.eGhostParent.removeChild(this.eGhost);
        }
        this.eGhost = null;
    };
    DragAndDropService.prototype.createGhost = function () {
        this.eGhost = _.loadTemplate(DragAndDropService_1.GHOST_TEMPLATE);
        var theme = this.environment.getTheme().theme;
        if (theme) {
            _.addCssClass(this.eGhost, theme);
        }
        this.eGhostIcon = this.eGhost.querySelector('.ag-dnd-ghost-icon');
        this.setGhostIcon(null);
        var eText = this.eGhost.querySelector('.ag-dnd-ghost-label');
        eText.innerHTML = _.escape(this.dragSource.dragItemName);
        this.eGhost.style.height = '25px';
        this.eGhost.style.top = '20px';
        this.eGhost.style.left = '20px';
        var usrDocument = this.gridOptionsWrapper.getDocument();
        this.eGhostParent = usrDocument.querySelector('body');
        if (!this.eGhostParent) {
            console.warn('ag-Grid: could not find document body, it is needed for dragging columns');
        }
        else {
            this.eGhostParent.appendChild(this.eGhost);
        }
    };
    DragAndDropService.prototype.setGhostIcon = function (iconName, shake) {
        if (shake === void 0) { shake = false; }
        _.clearElement(this.eGhostIcon);
        var eIcon;
        switch (iconName) {
            case DragAndDropService_1.ICON_ADD:
                eIcon = this.ePlusIcon;
                break;
            case DragAndDropService_1.ICON_PINNED:
                eIcon = this.ePinnedIcon;
                break;
            case DragAndDropService_1.ICON_MOVE:
                eIcon = this.eMoveIcon;
                break;
            case DragAndDropService_1.ICON_LEFT:
                eIcon = this.eLeftIcon;
                break;
            case DragAndDropService_1.ICON_RIGHT:
                eIcon = this.eRightIcon;
                break;
            case DragAndDropService_1.ICON_GROUP:
                eIcon = this.eGroupIcon;
                break;
            case DragAndDropService_1.ICON_AGGREGATE:
                eIcon = this.eAggregateIcon;
                break;
            case DragAndDropService_1.ICON_PIVOT:
                eIcon = this.ePivotIcon;
                break;
            case DragAndDropService_1.ICON_NOT_ALLOWED:
                eIcon = this.eDropNotAllowedIcon;
                break;
            default:
                eIcon = this.eHiddenIcon;
                break;
        }
        this.eGhostIcon.appendChild(eIcon);
        _.addOrRemoveCssClass(this.eGhostIcon, 'ag-shake-left-to-right', shake);
    };
    var DragAndDropService_1;
    DragAndDropService.ICON_PINNED = 'pinned';
    DragAndDropService.ICON_ADD = 'add';
    DragAndDropService.ICON_MOVE = 'move';
    DragAndDropService.ICON_LEFT = 'left';
    DragAndDropService.ICON_RIGHT = 'right';
    DragAndDropService.ICON_GROUP = 'group';
    DragAndDropService.ICON_AGGREGATE = 'aggregate';
    DragAndDropService.ICON_PIVOT = 'pivot';
    DragAndDropService.ICON_NOT_ALLOWED = 'notAllowed';
    DragAndDropService.GHOST_TEMPLATE = '<div class="ag-dnd-ghost">' +
        '  <span class="ag-dnd-ghost-icon ag-shake-left-to-right"></span>' +
        '  <div class="ag-dnd-ghost-label">' +
        '  </div>' +
        '</div>';
    __decorate([
        Autowired('gridOptionsWrapper')
    ], DragAndDropService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('dragService')
    ], DragAndDropService.prototype, "dragService", void 0);
    __decorate([
        Autowired('environment')
    ], DragAndDropService.prototype, "environment", void 0);
    __decorate([
        PostConstruct
    ], DragAndDropService.prototype, "init", null);
    __decorate([
        __param(0, Qualifier('loggerFactory'))
    ], DragAndDropService.prototype, "setBeans", null);
    __decorate([
        PreDestroy
    ], DragAndDropService.prototype, "destroy", null);
    DragAndDropService = DragAndDropService_1 = __decorate([
        Bean('dragAndDropService')
    ], DragAndDropService);
    return DragAndDropService;
}());
export { DragAndDropService };