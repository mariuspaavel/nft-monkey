
const {resolve, parse} = require('path');
const fs = require('fs');
const cliProgress = require('cli-progress');
const sharp = require('sharp');
const cliPrompt = require('prompt');
const pressAnyKey = require('press-any-key');

function shuffleArray(array: any[]) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

function getPathNameAndNumber(path: string): [string, number]{

    const dirName = parse(path).name
    const dirNameSplits = dirName.split('#');
    const name = dirNameSplits[0];
    const number = +(dirNameSplits[1]);

    return [name, number];

}

function maxDimensions(list: [number, number][]): [number, number]{

    const max: [number, number] = [0, 0];

    list.forEach(dimensions => {
        if(dimensions[0] > max[0]){
            max[0] = dimensions[0];
        }
        if(dimensions[1] > max[1]){
            max[1] = dimensions[1];
        }
    });

    return max;

}

class Project{

    tribes: Tribe[] = [];

    constructor(projectPath: string, meta: ProjectMeta){

        const tribedirs = fs.readdirSync(projectPath);

        for(const tribedir of tribedirs){

            const tribePath = resolve(projectPath, tribedir);
            if(fs.statSync(tribePath).isDirectory()){
                this.tribes.push(new Tribe(tribePath, meta));
            }


        }

    }

    async load(){
        for(const tribe of this.tribes){
            await tribe.load();
        }
    }

    generateArrangement(): NFT[]{

        const arrangement = [];

        this.tribes.forEach(tribe => arrangement.push(...tribe.generateArrangement()));

        shuffleArray(arrangement);
        arrangement.forEach((v, i) => v.index = i);

        return arrangement;
    }

}

class Tribe{

    name: string;
    amount: number;
    wClasses: WClass[] = [];
    totalWeight: number = 0;

    constructor(tribePath: string, meta: ProjectMeta){

        const [name, amount] = getPathNameAndNumber(tribePath);
        this.name = name;
        this.amount = amount || 100;

        const wclassdirs = fs.readdirSync(tribePath);

        for(const wclassdir of wclassdirs){

            const wclassPath = resolve(tribePath, wclassdir);
            if(fs.statSync(wclassPath).isDirectory()){
                const wClass = new WClass(wclassPath, meta);
                this.totalWeight += wClass.weight;
                this.wClasses.push(new WClass(wclassPath, meta));
            }

        }

    }

    async load(){
        for(const wClass of this.wClasses){
            await wClass.load();
        }
    }

    generateArrangement(): NFT[]{

        const arrangement = [];

        this.wClasses.forEach(
            wClass => arrangement.push(
                ...wClass.generateArrangement(Math.floor(this.amount * wClass.weight / this.totalWeight))
            )
        );

        return arrangement;
    }

}

class WClass{

    name: string;
    weight: number;
    projectMeta: ProjectMeta;
    totalPossible: number = 1;
    maxDimensions: [number, number];

    bodyPartLists: BodyPartList[] = [];

    constructor(wClassPath: string, meta: ProjectMeta){

        const [name, weight] = getPathNameAndNumber(wClassPath);
        this.name = name;
        this.weight = weight || 1;
        this.projectMeta = meta;

        const bodypartlists = fs.readdirSync(wClassPath);

        for(const bodypartlist of bodypartlists){

            const bodyPartListPath = resolve(wClassPath, bodypartlist);
            if(fs.statSync(bodyPartListPath).isDirectory()){
                this.bodyPartLists.push(new BodyPartList(bodyPartListPath));
            }

        }

        this.bodyPartLists.forEach(bodyPartList => this.totalPossible *= bodyPartList.bodyParts.length);

    }

    async load(){
        for(const bodyPartList of this.bodyPartLists){
            await bodyPartList.load();
        }
        this.maxDimensions = maxDimensions(this.bodyPartLists.map(bodyPartList => bodyPartList.maxDimensions));
    }

    generateArrangement(amount: number): NFT[]{

        if(amount > this.totalPossible){
            throw `The amount of NFT-s requested for class ${this.name} (${amount}) is too large, maximum is ${this.totalPossible}.`;
        }

        const arrangement: NFT[] = [];

        for(let i = 0; i < amount; i++){
            outer:while(true) {
                const newNft = this.generate();
                for (const other of arrangement) {
                    if(other.equals(newNft)){
                        continue outer;
                    }
                }
                arrangement.push(newNft);
                break;
            }
        }

        return arrangement;
    }

    generate(): NFT{

        return new NFT(this.bodyPartLists.map(bodyPartList => bodyPartList.chooseRandom()), this, this.projectMeta);

    }

}

class BodyPartList{

    name: string;
    bodyParts: BodyPart[] = [];
    totalWeight: number = 0;
    maxDimensions: [number, number];

    constructor(bodyPartListPath: string){

        this.name = parse(bodyPartListPath).name;
        const bodypartfiles = fs.readdirSync(bodyPartListPath);

        for(const bodypartfile of bodypartfiles){

            const bodyPartPath = resolve(bodyPartListPath, bodypartfile);
            if(!fs.statSync(bodyPartPath).isDirectory()){
                this.bodyParts.push(new BodyPart(bodyPartPath, this.name));
            }

        }

        this.bodyParts.forEach(bodyPart => this.totalWeight += bodyPart.weight);

    }

    async load(){
        for(const bodyPart of this.bodyParts){
            await bodyPart.load();
        }
        this.maxDimensions = maxDimensions(this.bodyParts.map(bodyPart => bodyPart.dimensions));
    }

    chooseRandom(): BodyPart{

        let x = Math.random() * this.totalWeight;

        for(const bodyPart of this.bodyParts){

            x -= bodyPart.weight;
            if(x <= 0){
                return bodyPart;
            }

        }

    }

}



class BodyPart{

    name: string;
    weight: number;
    listName: string;
    fullPath: string;
    image: any;
    dimensions: [number, number];

    constructor(path: string, listName: string){

        const [name, weight] = getPathNameAndNumber(path);
        this.name = name;
        this.weight = weight || 1;
        this.listName = listName;
        this.fullPath = path;

    }

    async load(){
        const image = await sharp(this.fullPath);
        const metadata = await image.metadata();
        this.dimensions = [metadata.width, metadata.height];
        this.image = await image.toBuffer();
    }

}



class NFT{

    bodyParts: BodyPart[];
    wClass: WClass;
    projectMeta: ProjectMeta;
    renderedImage: any;
    index: number;

    constructor(bodyParts: BodyPart[], wClass: WClass, meta: ProjectMeta){

        this.bodyParts = bodyParts;
        this.wClass = wClass;
        this.projectMeta = meta;

    }

    equals(other: NFT): boolean{

        if(this.bodyParts.length != other.bodyParts.length){
            return false;
        }
        for(let i = 0; i < other.bodyParts.length; i++){
            if(this.bodyParts[i] !== other.bodyParts[i]){
                return false;
            }
        }
        return true;

    }

    async render(){

        this.renderedImage = await sharp({
            create: {
                width: this.wClass.maxDimensions[0],
                height: this.wClass.maxDimensions[1],
                channels: 4,
                background: '#00000000'
            }
        })
        .composite(
            this.bodyParts.map(bodyPart => {return {input: bodyPart.image, gravity: 'center'}})
        );

    }

    get meta(): NFTMeta{
        return {
            name: `${this.projectMeta.name}#${this.index + 1}`,
            image: "To be replaced",
            edition: this.index + 1,
            description: this.projectMeta.description,
            attributes: this.bodyParts.map(bodyPart => {return{
                trait_type: bodyPart.listName,
                value: bodyPart.name
            }})
        };
    }

}

class ProjectMeta {

    name: string;
    description: string;

}

class NFTMeta {

    name: string;
    description: string;
    image: string;
    edition: number;
    attributes: NFTAttribute[];

}

class NFTAttribute{

    trait_type: string;
    value: string;

}



async function run(){

    let {inputPath, outputPath, name, description} =
        await cliPrompt.get(['inputPath', 'outputPath', 'name', 'description']);

    inputPath = resolve(inputPath);
    outputPath = resolve(outputPath);

    // const inputPath = resolve(process.argv[2] ?? 'input');
    // const outputPath = resolve(process.argv[3] ?? 'output');

    //console.log(inputPath);
    const projectMeta = {name, description};

    const project = new Project(inputPath, projectMeta);
    await project.load();
    //console.log(JSON.stringify(project, null, 2));
    const nfts = project.generateArrangement();

    fs.mkdirSync(outputPath);
    const imagesPath = resolve(outputPath, 'images');
    const metadataPath = resolve(outputPath, 'metadata');
    fs.mkdirSync(imagesPath);
    fs.mkdirSync(metadataPath);

    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar1.start(nfts.length, 0);

    for(let i = 0; i < nfts.length; i++){
        const nft = nfts[i];
        await nft.render();
        nft.renderedImage.toFile(resolve(outputPath, 'images', nft.index + 1 + '.png'));
        fs.writeFileSync(
            resolve(metadataPath, nft.index + 1 + '.json'),
            JSON.stringify(nft.meta, null, 2)
        );
        bar1.update(i + 1);
    }

    bar1.stop();

    pressAnyKey('Completed, press any key to exit...');

}

run();