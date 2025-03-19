"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusEnum = exports.DepartmentEnum = exports.FileTypeEnum = void 0;
var FileTypeEnum;
(function (FileTypeEnum) {
    FileTypeEnum["pdf"] = "pdf";
    FileTypeEnum["jpeg"] = "jpeg";
})(FileTypeEnum || (exports.FileTypeEnum = FileTypeEnum = {}));
var DepartmentEnum;
(function (DepartmentEnum) {
    DepartmentEnum["IT"] = "IT";
    DepartmentEnum["PARKS"] = "PARKS";
    DepartmentEnum["FIRE"] = "FIRE";
})(DepartmentEnum || (exports.DepartmentEnum = DepartmentEnum = {}));
var StatusEnum;
(function (StatusEnum) {
    StatusEnum["Purchased"] = "Purchased";
    StatusEnum["Pending"] = "Pending";
    StatusEnum["PendingSecondaryApproval"] = "Pending Secondary Approval";
    StatusEnum["Approved"] = "Approved";
    StatusEnum["ApprovedForAP"] = "Approved For AP";
    StatusEnum["Completed"] = "Completed";
    StatusEnum["Closed"] = "Closed";
    StatusEnum["Denied"] = "Denied";
})(StatusEnum || (exports.StatusEnum = StatusEnum = {}));
//# sourceMappingURL=types.js.map