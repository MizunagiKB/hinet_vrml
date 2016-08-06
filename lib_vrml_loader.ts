/**
 * @author mrdoob / http://mrdoob.com/ (orig)
 * @author MizunagiKB / http://mizuvm01.cloudapp.net/wp
 */
/// <reference path="./DefinitelyTyped/threejs/three.d.ts"/>


namespace THREE {

    interface ITree {
        name: string;
        nodeType: string;
        parent: ITree;
        children: Array<any>;
        comment: string;
    }


    export class VRMLLoader {

        manager: LoadingManager;
        texturePath: string = "";

        // for IndexedFaceSet support
        isRecordingPoints: boolean = false;
        isRecordingFaces: boolean = false;
        points = Array();
        indexes = Array();

        // for Background support
        isRecordingAngles: boolean = false;
        isRecordingColors: boolean = false;
        angles = Array();
        colors = Array();

        recordingFieldname: any = null;
        crossOrigin: any = null;

        index = Array();

        constructor(manager?: LoadingManager) {
            this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
        }

        load(url: string, onLoad: any, onProgress: any, onError: any): void {
            let loader = new THREE.XHRLoader(this.manager);
            loader.load(
                url,
                function(text) {
                    onLoad(this.parse(text));
                }, onProgress, onError
            );
        }

        setCrossOrigin(value: any) {

            this.crossOrigin = value;
        }

        parseProperty(node: ITree, line: string): void {

            let parts = Array();
            let part: any;
            let property = {};
            let fieldName: any;

            /**
            * Expression for matching relevant information, such as a name or value, but not the separators
            * @type {RegExp}
            */
            var regex = /[^\s,\[\]]+/g;

            var point: any, angles: any, colors: any;

            while (null != (part = regex.exec(line))) {

                parts.push(part[0]);

            }

            fieldName = parts[0];

            // trigger several recorders
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

                // the parts hold the indexes as strings
                if (parts.length > 0) {

                    for (var ind = 0; ind < parts.length; ind++) {

                        // the part should either be positive integer or -1
                        if (! /(-?\d+)/.test(parts[ind])) {

                            continue;

                        }

                        // end of current face
                        if (parts[ind] === "-1") {

                            if (this.index.length > 0) {

                                this.indexes.push(this.index);

                            }

                            // start new one
                            this.index = [];

                        } else {

                            this.index.push(parseInt(parts[ind]));

                        }

                    }

                }

                // end
                if (/]/.exec(line)) {

                    if (this.index.length > 0) {

                        this.indexes.push(this.index);

                    }

                    // start new one
                    this.index = [];

                    this.isRecordingFaces = false;
                    node[this.recordingFieldname] = this.indexes;

                }

            } else if (this.isRecordingPoints) {

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

                // end
                if (/]/.exec(line)) {

                    this.isRecordingPoints = false;
                    node.points = this.points;

                }

            } else if (this.isRecordingAngles) {

                // the parts hold the angles as strings
                if (parts.length > 0) {

                    for (var ind = 0; ind < parts.length; ind++) {

                        // the part should be a float
                        if (!float_pattern.test(parts[ind])) {

                            continue;

                        }

                        this.angles.push(parseFloat(parts[ind]));

                    }

                }

                // end
                if (/]/.exec(line)) {

                    this.isRecordingAngles = false;
                    node[this.recordingFieldname] = this.angles;

                }

            } else if (this.isRecordingColors) {

                while (null !== (parts = float3_pattern.exec(line))) {

                    color = {
                        r: parseFloat(parts[1]),
                        g: parseFloat(parts[2]),
                        b: parseFloat(parts[3])
                    };

                    this.colors.push(color);

                }

                // end
                if (/]/.exec(line)) {

                    this.isRecordingColors = false;
                    node[this.recordingFieldname] = this.colors;

                }

            } else if (parts[parts.length - 1] !== 'NULL' && fieldName !== 'children') {

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

        }


        getTree(lines: Array<string>): ITree {
            let tree: ITree = { name: "Scene", nodeType: "Scene", parent: null, children: [], comment: "" };
            let current = tree;
            let matches: any;
            let specification: any;

            for (let i: number = 0; i < lines.length; i++) {
                let comment = '';
                let line = lines[i];

                // omit whitespace only lines
                if (null !== /^\s+?$/g.exec(line)) {
                    continue;
                }

                line = line.trim();

                // skip empty lines
                if (line === '') {
                    continue;
                }

                if (/#/.exec(line)) {
                    let parts = line.split('#');
                    // discard everything after the #, it is a comment
                    line = parts[0];
                    // well, let's also keep the comment
                    comment = parts[1];
                }

                if (matches = /([^\s]*){1}(?:\s+)?{/.exec(line)) {
                    // first subpattern should match the Node name
                    let block: ITree = { name: line, nodeType: matches[1], parent: current, children: Array(), comment: comment };

                    current.children.push(block);
                    current = block;

                    if (/}/.exec(line)) {

                        // example: geometry Box { size 1 1 1 } # all on the same line
                        specification = /{(.*)}/.exec(line)[1];
                        // todo: remove once new parsing is complete?
                        block.children.push(specification);

                        this.parseProperty(current, specification);

                        current = current.parent;
                    }
                } else if (/}/.exec(line)) {

                    current = current.parent;

                } else if (line !== '') {

                    this.parseProperty(current, line);
                    // todo: remove once new parsing is complete? we still do not parse geometry and appearance the new way
                    current.children.push(line);
                }
            }

            return tree;
        }

        parseV1(lines: Array<string>, scene: Scene): void {
            console.warn('VRML V1.0 not supported yet');
        }

        parseV2(lines: Array<string>, scene: Scene): void {
            let defines = {};
            let float_pattern = /(\b|\-|\+)([\d\.e]+)/;
            let float2_pattern = /([\d\.\+\-e]+)\s+([\d\.\+\-e]+)/g;
            let float3_pattern = /([\d\.\+\-e]+)[\s|,]+([\d\.\+\-e]+)[\s|,]+([\d\.\+\-e]+)/g;

            this.parseNode(getTree(lines), scene);
        }

        parse(data: any): Scene {
            let scene = new Scene();
            let texturePath = this.texturePath;
            let textureLoader = new TextureLoader(this.manager);

            textureLoader.setCrossOrigin(this.crossOrigin);

            let lines = data.split('\n');

            // some lines do not have breaks
            for (let i: number = lines.length - 1; i > -1; i--) {
                // split lines with {..{ or {..[ - some have both
                if (/{.*[{\[]/.test(lines[i])) {
                    let parts = lines[i].split('{').join('{\n').split('\n');
                    parts.unshift(1);
                    parts.unshift(i);
                    lines.splice.apply(lines, parts);
                } else {
                    // split lines with ]..}
                    if (/\].*}/.test(lines[i])) {
                        let parts = lines[i].split(']').join(']\n').split('\n');
                        parts.unshift(1);
                        parts.unshift(i);
                        lines.splice.apply(lines, parts);
                    }
                }

                // split lines with }..}
                if (/}.*}/.test(lines[i])) {
                    let parts = lines[i].split('}').join('}\n').split('\n');
                    parts.unshift(1);
                    parts.unshift(i);
                    lines.splice.apply(lines, parts);
                }

                // force the parser to create Coordinate node for empty coords
                // coord USE something -> coord USE something Coordinate {}
                if ((lines[i].indexOf('coord') > -1) && (lines[i].indexOf('[') < 0) && (lines[i].indexOf('{') < 0)) {
                    lines[i] += ' Coordinate {}';
                }
            }

            console.log(lines);

            let header = lines.shift();

            if (/V1.0/.exec(header)) {
                this.parseV1(lines, scene);
            } else if (/V2.0/.exec(header)) {
                this.parseV2(lines, scene);
            }

            return scene;
        }

    }
}
