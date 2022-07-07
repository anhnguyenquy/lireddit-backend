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
exports.User = void 0;
var type_graphql_1 = require("type-graphql");
var typeorm_1 = require("typeorm");
var _1 = require(".");
var User = /** @class */ (function (_super) {
    __extends(User, _super);
    function User() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        (0, type_graphql_1.Field)(function () { return type_graphql_1.Int; }),
        (0, typeorm_1.PrimaryGeneratedColumn)()
    ], User.prototype, "id");
    __decorate([
        (0, type_graphql_1.Field)(function () { return Date; }),
        (0, typeorm_1.CreateDateColumn)()
    ], User.prototype, "createdAt");
    __decorate([
        (0, type_graphql_1.Field)(function () { return Date; }),
        (0, typeorm_1.UpdateDateColumn)()
    ], User.prototype, "updatedAt");
    __decorate([
        (0, type_graphql_1.Field)(),
        (0, typeorm_1.Column)({ unique: true })
    ], User.prototype, "username");
    __decorate([
        (0, type_graphql_1.Field)(),
        (0, typeorm_1.Column)({ unique: true, nullable: false })
    ], User.prototype, "email");
    __decorate([
        (0, typeorm_1.Column)({ nullable: false })
    ], User.prototype, "password");
    __decorate([
        (0, typeorm_1.OneToMany)(function () { return _1.Post; }, function (post) { return post.creator; })
    ], User.prototype, "posts");
    __decorate([
        (0, typeorm_1.OneToMany)(function () { return _1.Updoot; }, function (updoot) { return updoot.user; })
    ], User.prototype, "updoots");
    User = __decorate([
        (0, type_graphql_1.ObjectType)() // The ObjectType and Field decorators are used to tell TypeGraphQL how to render the User entity
        ,
        (0, typeorm_1.Entity)()
    ], User);
    return User;
}(typeorm_1.BaseEntity));
exports.User = User;
