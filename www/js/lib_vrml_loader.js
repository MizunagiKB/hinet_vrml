var THREE;
(function (THREE) {
    var VRMLLoader = (function () {
        function VRMLLoader(manager) {
            this.texturePath = "";
            this.isRecordingPoints = false;
            this.isRecordingFaces = false;
            this.points = Array();
            this.indexes = Array();
            this.isRecordingAngles = false;
            this.isRecordingColors = false;
            this.angles = Array();
            this.colors = Array();
            this.recordingFieldname = null;
            this.crossOrigin = null;
            this.index = Array();
            this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
        }
        VRMLLoader.prototype.load = function (url, onLoad, onProgress, onError) {
            var loader = new THREE.XHRLoader(this.manager);
            loader.load(url, function (text) {
                onLoad(this.parse(text));
            }, onProgress, onError);
        };
        VRMLLoader.prototype.setCrossOrigin = function (value) {
            this.crossOrigin = value;
        };
        VRMLLoader.prototype.parseProperty = function (node, line) {
            var parts = Array();
            var part;
            var property = {};
            var fieldName;
            var regex = /[^\s,\[\]]+/g;
            var point, angles, colors;
            while (null != (part = regex.exec(line))) {
                parts.push(part[0]);
            }
            fieldName = parts[0];
            switch (fieldName) {
                case 'skyAngle':
                case 'groundAngle':
                    this.recordingFieldname = fieldName;
                    this.isRecordingAngles = true;
                    this.angles = [];
                    break;
                case 'skyColor':
                case 'groundColor':
                case 'color':
                    this.recordingFieldname = fieldName;
                    this.isRecordingColors = true;
                    this.colors = [];
                    break;
                case 'point':
                    this.recordingFieldname = fieldName;
                    this.isRecordingPoints = true;
                    this.points = [];
                    break;
                case 'coordIndex':
                case 'texCoordIndex':
                    this.recordingFieldname = fieldName;
                    this.isRecordingFaces = true;
                    this.indexes = [];
                    break;
            }
            if (this.isRecordingFaces) {
                if (parts.length > 0) {
                    for (var ind = 0; ind < parts.length; ind++) {
                        if (!/(-?\d+)/.test(parts[ind])) {
                            continue;
                        }
                        if (parts[ind] === "-1") {
                            if (this.index.length > 0) {
                                this.indexes.push(this.index);
                            }
                            this.index = [];
                        }
                        else {
                            this.index.push(parseInt(parts[ind]));
                        }
                    }
                }
                if (/]/.exec(line)) {
                    if (this.index.length > 0) {
                        this.indexes.push(this.index);
                    }
                    this.index = [];
                    this.isRecordingFaces = false;
                    node[this.recordingFieldname] = this.indexes;
                }
            }
            else if (this.isRecordingPoints) {
                if (node.nodeType == 'Coordinate')
                    while (null !== (parts = float3_pattern.exec(line))) {
                        point = {
                            x: parseFloat(parts[1]),
                            y: parseFloat(parts[2]),
                            z: parseFloat(parts[3])
                        };
                        this.points.push(point);
                    }
                if (node.nodeType == 'TextureCoordinate')
                    while (null !== (parts = float2_pattern.exec(line))) {
                        point = {
                            x: parseFloat(parts[1]),
                            y: parseFloat(parts[2])
                        };
                        this.points.push(point);
                    }
                if (/]/.exec(line)) {
                    this.isRecordingPoints = false;
                    node.points = this.points;
                }
            }
            else if (this.isRecordingAngles) {
                if (parts.length > 0) {
                    for (var ind = 0; ind < parts.length; ind++) {
                        if (!float_pattern.test(parts[ind])) {
                            continue;
                        }
                        this.angles.push(parseFloat(parts[ind]));
                    }
                }
                if (/]/.exec(line)) {
                    this.isRecordingAngles = false;
                    node[this.recordingFieldname] = this.angles;
                }
            }
            else if (this.isRecordingColors) {
                while (null !== (parts = float3_pattern.exec(line))) {
                    color = {
                        r: parseFloat(parts[1]),
                        g: parseFloat(parts[2]),
                        b: parseFloat(parts[3])
                    };
                    this.colors.push(color);
                }
                if (/]/.exec(line)) {
                    this.isRecordingColors = false;
                    node[this.recordingFieldname] = this.colors;
                }
            }
            else if (parts[parts.length - 1] !== 'NULL' && fieldName !== 'children') {
                switch (fieldName) {
                    case 'diffuseColor':
                    case 'emissiveColor':
                    case 'specularColor':
                    case 'color':
                        if (parts.length != 4) {
                            console.warn('Invalid color format detected for ' + fieldName);
                            break;
                        }
                        property = {
                            r: parseFloat(parts[1]),
                            g: parseFloat(parts[2]),
                            b: parseFloat(parts[3])
                        };
                        break;
                    case 'translation':
                    case 'scale':
                    case 'size':
                        if (parts.length != 4) {
                            console.warn('Invalid vector format detected for ' + fieldName);
                            break;
                        }
                        property = {
                            x: parseFloat(parts[1]),
                            y: parseFloat(parts[2]),
                            z: parseFloat(parts[3])
                        };
                        break;
                    case 'radius':
                    case 'topRadius':
                    case 'bottomRadius':
                    case 'height':
                    case 'transparency':
                    case 'shininess':
                    case 'ambientIntensity':
                        if (parts.length != 2) {
                            console.warn('Invalid single float value specification detected for ' + fieldName);
                            break;
                        }
                        property = parseFloat(parts[1]);
                        break;
                    case 'rotation':
                        if (parts.length != 5) {
                            console.warn('Invalid quaternion format detected for ' + fieldName);
                            break;
                        }
                        property = {
                            x: parseFloat(parts[1]),
                            y: parseFloat(parts[2]),
                            z: parseFloat(parts[3]),
                            w: parseFloat(parts[4])
                        };
                        break;
                    case 'ccw':
                    case 'solid':
                    case 'colorPerVertex':
                    case 'convex':
                        if (parts.length != 2) {
                            console.warn('Invalid format detected for ' + fieldName);
                            break;
                        }
                        property = parts[1] === 'TRUE' ? true : false;
                        break;
                }
                node[fieldName] = property;
            }
            return property;
        };
        VRMLLoader.prototype.getTree = function (lines) {
            var tree = { name: "Scene", nodeType: "Scene", parent: null, children: [], comment: "" };
            var current = tree;
            var matches;
            var specification;
            for (var i = 0; i < lines.length; i++) {
                var comment = '';
                var line = lines[i];
                if (null !== /^\s+?$/g.exec(line)) {
                    continue;
                }
                line = line.trim();
                if (line === '') {
                    continue;
                }
                if (/#/.exec(line)) {
                    var parts = line.split('#');
                    line = parts[0];
                    comment = parts[1];
                }
                if (matches = /([^\s]*){1}(?:\s+)?{/.exec(line)) {
                    var block = { name: line, nodeType: matches[1], parent: current, children: Array(), comment: comment };
                    current.children.push(block);
                    current = block;
                    if (/}/.exec(line)) {
                        specification = /{(.*)}/.exec(line)[1];
                        block.children.push(specification);
                        this.parseProperty(current, specification);
                        current = current.parent;
                    }
                }
                else if (/}/.exec(line)) {
                    current = current.parent;
                }
                else if (line !== '') {
                    this.parseProperty(current, line);
                    current.children.push(line);
                }
            }
            return tree;
        };
        VRMLLoader.prototype.parseV1 = function (lines, scene) {
            console.warn('VRML V1.0 not supported yet');
        };
        VRMLLoader.prototype.parseV2 = function (lines, scene) {
            var defines = {};
            var float_pattern = /(\b|\-|\+)([\d\.e]+)/;
            var float2_pattern = /([\d\.\+\-e]+)\s+([\d\.\+\-e]+)/g;
            var float3_pattern = /([\d\.\+\-e]+)[\s|,]+([\d\.\+\-e]+)[\s|,]+([\d\.\+\-e]+)/g;
            this.parseNode(getTree(lines), scene);
        };
        VRMLLoader.prototype.parse = function (data) {
            var scene = new THREE.Scene();
            var texturePath = this.texturePath;
            var textureLoader = new THREE.TextureLoader(this.manager);
            textureLoader.setCrossOrigin(this.crossOrigin);
            var lines = data.split('\n');
            for (var i = lines.length - 1; i > -1; i--) {
                if (/{.*[{\[]/.test(lines[i])) {
                    var parts = lines[i].split('{').join('{\n').split('\n');
                    parts.unshift(1);
                    parts.unshift(i);
                    lines.splice.apply(lines, parts);
                }
                else {
                    if (/\].*}/.test(lines[i])) {
                        var parts = lines[i].split(']').join(']\n').split('\n');
                        parts.unshift(1);
                        parts.unshift(i);
                        lines.splice.apply(lines, parts);
                    }
                }
                if (/}.*}/.test(lines[i])) {
                    var parts = lines[i].split('}').join('}\n').split('\n');
                    parts.unshift(1);
                    parts.unshift(i);
                    lines.splice.apply(lines, parts);
                }
                if ((lines[i].indexOf('coord') > -1) && (lines[i].indexOf('[') < 0) && (lines[i].indexOf('{') < 0)) {
                    lines[i] += ' Coordinate {}';
                }
            }
            console.log(lines);
            var header = lines.shift();
            if (/V1.0/.exec(header)) {
                this.parseV1(lines, scene);
            }
            else if (/V2.0/.exec(header)) {
                this.parseV2(lines, scene);
            }
            return scene;
        };
        return VRMLLoader;
    }());
    THREE.VRMLLoader = VRMLLoader;
})(THREE || (THREE = {}));
//# sourceMappingURL=lib_vrml_loader.js.map