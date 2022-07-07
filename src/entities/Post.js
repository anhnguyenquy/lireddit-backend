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
exports.Post = void 0;
var type_graphql_1 = require("type-graphql");
var typeorm_1 = require("typeorm");
var _1 = require(".");
var Post = /** @class */ (function (_super) {
    __extends(Post, _super);
    function Post() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        (0, type_graphql_1.Field)(function () { return type_graphql_1.Int; }),
        (0, typeorm_1.PrimaryGeneratedColumn)()
    ], Post.prototype, "id");
    __decorate([
        (0, type_graphql_1.Field)(function () { return Date; }),
        (0, typeorm_1.CreateDateColumn)()
    ], Post.prototype, "createdAt");
    __decorate([
        (0, type_graphql_1.Field)(function () { return Date; }),
        (0, typeorm_1.UpdateDateColumn)()
    ], Post.prototype, "updatedAt");
    __decorate([
        (0, type_graphql_1.Field)(),
        (0, typeorm_1.Column)()
    ], Post.prototype, "title");
    __decorate([
        (0, type_graphql_1.Field)(),
        (0, typeorm_1.Column)()
    ], Post.prototype, "text");
    __decorate([
        (0, type_graphql_1.Field)(function () { return type_graphql_1.Int; }),
        (0, typeorm_1.Column)()
    ], Post.prototype, "creatorId");
    __decorate([
        (0, type_graphql_1.Field)(function () { return _1.User; })
        // Many Posts are linked to One User
        ,
        (0, typeorm_1.ManyToOne)(function () { return _1.User; }, function (user) { return user.posts; })
    ], Post.prototype, "creator");
    __decorate([
        (0, typeorm_1.OneToMany)(function () { return _1.Updoot; }, function (updoot) { return updoot.post; })
    ], Post.prototype, "updoots");
    __decorate([
        (0, type_graphql_1.Field)(function () { return type_graphql_1.Int; }),
        (0, typeorm_1.Column)({ type: 'int', "default": 0 })
    ], Post.prototype, "points");
    __decorate([
        (0, type_graphql_1.Field)(function () { return type_graphql_1.Int; }, { nullable: true })
    ], Post.prototype, "voteStatus");
    Post = __decorate([
        (0, type_graphql_1.ObjectType)() // The ObjectType and Field decorators use TypeScript to define GraphQL types.
        ,
        (0, typeorm_1.Entity)()
    ], Post);
    return Post;
}(typeorm_1.BaseEntity));
exports.Post = Post;
