"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = async (policyContext) => policyContext.state.user?.role?.type === "admin";
