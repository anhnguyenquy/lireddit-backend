"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.Updoot = void 0;
var type_graphql_1 = require("type-graphql");
var typeorm_1 = require("typeorm");
var _1 = require(".");
// Many to Many relationship
// user <-> posts
// user -> updoot <- post
var Updoot = /** @class */ (function (_super) {
    __extends(Updoot, _super);
    function Updoot() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        (0, type_graphql_1.Field)(function () { return type_graphql_1.Int; }),
        (0, typeorm_1.Column)({ type: 'int' })
    ], Updoot.prototype, "value");
    __decorate([
        (0, type_graphql_1.Field)(function () { return type_graphql_1.Int; }),
        (0, typeorm_1.PrimaryColumn)()
    ], Updoot.prototype, "userId");
    __decorate([
        (0, type_graphql_1.Field)(function () { return _1.User; })
        // Many Updoots are linked to One User
        ,
        (0, typeorm_1.ManyToOne)(function () { return _1.User; }, function (user) { return user.updoots; })
    ], Updoot.prototype, "user");
    __decorate([
        (0, type_graphql_1.Field)(function () { return type_graphql_1.Int; }),
        (0, typeorm_1.PrimaryColumn)()
    ], Updoot.prototype, "postId");
    __decorate([
        (0, type_graphql_1.Field)(function () { return _1.Post; })
        // Many Updoots are linked to One Post
        ,
        (0, typeorm_1.ManyToOne)(function () { return _1.Post; }, function (post) { return post.updoots; }, {
            onDelete: 'CASCADE' // when a post is deleted, delete the updoots linked to it as well
        })
    ], Updoot.prototype, "post");
    Updoot = __decorate([
        (0, type_graphql_1.ObjectType)(),
        (0, typeorm_1.Entity)()
    ], Updoot);
    return Updoot;
}(typeorm_1.BaseEntity));
exports.Updoot = Updoot;
