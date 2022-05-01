var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a = require('path'), resolve = _a.resolve, parse = _a.parse;
var fs = require('fs');
var cliProgress = require('cli-progress');
var sharp = require('sharp');
function shuffleArray(array) {
    var _a;
    var currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        _a = [
            array[randomIndex], array[currentIndex]
        ], array[currentIndex] = _a[0], array[randomIndex] = _a[1];
    }
    return array;
}
function getPathNameAndNumber(path) {
    var dirName = parse(path).name;
    var dirNameSplits = dirName.split('#');
    var name = dirNameSplits[0];
    var number = +(dirNameSplits[1]);
    return [name, number];
}
function maxDimensions(list) {
    var max = [0, 0];
    list.forEach(function (dimensions) {
        if (dimensions[0] > max[0]) {
            max[0] = dimensions[0];
        }
        if (dimensions[1] > max[1]) {
            max[1] = dimensions[1];
        }
    });
    return max;
}
var Project = /** @class */ (function () {
    function Project(projectPath) {
        this.tribes = [];
        var tribedirs = fs.readdirSync(projectPath);
        for (var _i = 0, tribedirs_1 = tribedirs; _i < tribedirs_1.length; _i++) {
            var tribedir = tribedirs_1[_i];
            var tribePath = resolve(projectPath, tribedir);
            if (fs.statSync(tribePath).isDirectory()) {
                this.tribes.push(new Tribe(tribePath));
            }
        }
    }
    Project.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, tribe;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.tribes;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        tribe = _a[_i];
                        return [4 /*yield*/, tribe.load()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Project.prototype.generateArrangement = function () {
        var arrangement = [];
        this.tribes.forEach(function (tribe) { return arrangement.push.apply(arrangement, tribe.generateArrangement()); });
        shuffleArray(arrangement);
        return arrangement;
    };
    return Project;
}());
var Tribe = /** @class */ (function () {
    function Tribe(tribePath) {
        this.wClasses = [];
        this.totalWeight = 0;
        var _a = getPathNameAndNumber(tribePath), name = _a[0], amount = _a[1];
        this.name = name;
        this.amount = amount || 100;
        var wclassdirs = fs.readdirSync(tribePath);
        for (var _i = 0, wclassdirs_1 = wclassdirs; _i < wclassdirs_1.length; _i++) {
            var wclassdir = wclassdirs_1[_i];
            var wclassPath = resolve(tribePath, wclassdir);
            if (fs.statSync(wclassPath).isDirectory()) {
                var wClass = new WClass(wclassPath);
                this.totalWeight += wClass.weight;
                this.wClasses.push(new WClass(wclassPath));
            }
        }
    }
    Tribe.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, wClass;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.wClasses;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        wClass = _a[_i];
                        return [4 /*yield*/, wClass.load()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Tribe.prototype.generateArrangement = function () {
        var _this = this;
        var arrangement = [];
        this.wClasses.forEach(function (wClass) { return arrangement.push.apply(arrangement, wClass.generateArrangement(Math.floor(_this.amount * wClass.weight / _this.totalWeight))); });
        return arrangement;
    };
    return Tribe;
}());
var WClass = /** @class */ (function () {
    function WClass(wClassPath) {
        var _this = this;
        this.totalPossible = 1;
        this.bodyPartLists = [];
        var _a = getPathNameAndNumber(wClassPath), name = _a[0], weight = _a[1];
        this.name = name;
        this.weight = weight || 1;
        var bodypartlists = fs.readdirSync(wClassPath);
        for (var _i = 0, bodypartlists_1 = bodypartlists; _i < bodypartlists_1.length; _i++) {
            var bodypartlist = bodypartlists_1[_i];
            var bodyPartListPath = resolve(wClassPath, bodypartlist);
            if (fs.statSync(bodyPartListPath).isDirectory()) {
                this.bodyPartLists.push(new BodyPartList(bodyPartListPath));
            }
        }
        this.bodyPartLists.forEach(function (bodyPartList) { return _this.totalPossible *= bodyPartList.bodyParts.length; });
    }
    WClass.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, bodyPartList;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.bodyPartLists;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        bodyPartList = _a[_i];
                        return [4 /*yield*/, bodyPartList.load()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.maxDimensions = maxDimensions(this.bodyPartLists.map(function (bodyPartList) { return bodyPartList.maxDimensions; }));
                        return [2 /*return*/];
                }
            });
        });
    };
    WClass.prototype.generateArrangement = function (amount) {
        if (amount > this.totalPossible) {
            throw "The amount of NFT-s requested for class " + this.name + " (" + amount + ") is too large, maximum is " + this.totalPossible + ".";
        }
        var arrangement = [];
        for (var i = 0; i < amount; i++) {
            outer: while (true) {
                var newNft = this.generate();
                for (var _i = 0, arrangement_1 = arrangement; _i < arrangement_1.length; _i++) {
                    var other = arrangement_1[_i];
                    if (other.equals(newNft)) {
                        continue outer;
                    }
                }
                arrangement.push(newNft);
                break;
            }
        }
        return arrangement;
    };
    WClass.prototype.generate = function () {
        return new NFT(this.bodyPartLists.map(function (bodyPartList) { return bodyPartList.chooseRandom(); }), this);
    };
    return WClass;
}());
var BodyPartList = /** @class */ (function () {
    function BodyPartList(bodyPartListPath) {
        var _this = this;
        this.bodyParts = [];
        this.totalWeight = 0;
        this.name = parse(bodyPartListPath).name;
        var bodypartfiles = fs.readdirSync(bodyPartListPath);
        for (var _i = 0, bodypartfiles_1 = bodypartfiles; _i < bodypartfiles_1.length; _i++) {
            var bodypartfile = bodypartfiles_1[_i];
            var bodyPartPath = resolve(bodyPartListPath, bodypartfile);
            if (!fs.statSync(bodyPartPath).isDirectory()) {
                this.bodyParts.push(new BodyPart(bodyPartPath));
            }
        }
        this.bodyParts.forEach(function (bodyPart) { return _this.totalWeight += bodyPart.weight; });
    }
    BodyPartList.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, bodyPart;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.bodyParts;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        bodyPart = _a[_i];
                        return [4 /*yield*/, bodyPart.load()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.maxDimensions = maxDimensions(this.bodyParts.map(function (bodyPart) { return bodyPart.dimensions; }));
                        return [2 /*return*/];
                }
            });
        });
    };
    BodyPartList.prototype.chooseRandom = function () {
        var x = Math.random() * this.totalWeight;
        for (var _i = 0, _a = this.bodyParts; _i < _a.length; _i++) {
            var bodyPart = _a[_i];
            x -= bodyPart.weight;
            if (x <= 0) {
                return bodyPart;
            }
        }
    };
    return BodyPartList;
}());
var BodyPart = /** @class */ (function () {
    function BodyPart(path) {
        var _a = getPathNameAndNumber(path), name = _a[0], weight = _a[1];
        this.name = name;
        this.weight = weight || 1;
        this.fullPath = path;
    }
    BodyPart.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var image, metadata, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, sharp(this.fullPath)];
                    case 1:
                        image = _b.sent();
                        return [4 /*yield*/, image.metadata()];
                    case 2:
                        metadata = _b.sent();
                        this.dimensions = [metadata.width, metadata.height];
                        _a = this;
                        return [4 /*yield*/, image.toBuffer()];
                    case 3:
                        _a.image = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return BodyPart;
}());
var NFT = /** @class */ (function () {
    function NFT(bodyParts, wClass) {
        this.bodyParts = bodyParts;
        this.wClass = wClass;
    }
    NFT.prototype.equals = function (other) {
        if (this.bodyParts.length != other.bodyParts.length) {
            return false;
        }
        for (var i = 0; i < other.bodyParts.length; i++) {
            if (this.bodyParts[i] !== other.bodyParts[i]) {
                return false;
            }
        }
        return true;
    };
    NFT.prototype.render = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, sharp({
                                create: {
                                    width: this.wClass.maxDimensions[0],
                                    height: this.wClass.maxDimensions[1],
                                    channels: 4,
                                    background: '#00000000'
                                }
                            })
                                .composite(this.bodyParts.map(function (bodyPart) { return { input: bodyPart.image, gravity: 'center' }; }))];
                    case 1:
                        _a.renderedImage = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return NFT;
}());
function run() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var inputPath, outputPath, project, nfts, bar1, i, nft;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    inputPath = resolve((_a = process.argv[2]) !== null && _a !== void 0 ? _a : 'input');
                    outputPath = resolve((_b = process.argv[3]) !== null && _b !== void 0 ? _b : 'output');
                    project = new Project(inputPath);
                    return [4 /*yield*/, project.load()];
                case 1:
                    _c.sent();
                    nfts = project.generateArrangement();
                    //console.log(nfts);
                    fs.mkdirSync(outputPath);
                    bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
                    bar1.start(nfts.length, 0);
                    i = 0;
                    _c.label = 2;
                case 2:
                    if (!(i < nfts.length)) return [3 /*break*/, 5];
                    nft = nfts[i];
                    return [4 /*yield*/, nft.render()];
                case 3:
                    _c.sent();
                    nft.renderedImage.toFile(resolve(outputPath, i + ".png"));
                    bar1.update(i + 1);
                    _c.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5:
                    bar1.stop();
                    return [2 /*return*/];
            }
        });
    });
}
run();
