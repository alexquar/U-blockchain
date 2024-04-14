import * as crypto from 'crypto'
class Transaction {
    constructor(
        public amout:number,
        public payer:string, //pub key
        public payee:string //pub key
    ) {}

    toString():string {
        return JSON.stringify(this);
    }
}

class Block{
    constructor(
         public prevHash: string,
        public transaction: Transaction,
        public ts = Date.now()
    ){

    }
    get hash(){
        const str = JSON.stringify(this);
        const hash = crypto.createHash('SHA256')  ;
        hash.update(str).end();
        return hash.digest('hex');
    }
}

class Chain{
    public static instance = new Chain()
    chain : Block[]; 
    constructor(){
        this.chain = [new Block('', new Transaction(100, 'genesis', 'aquarrie'))];
    }
    get lastBlock(){
        return this.chain[this.chain.length -1];
    }
    addBlock(transaction:Transaction, senderPublicKey:string, signature:Buffer){
        const newBlock = new Block(this.lastBlock.hash, transaction);
        this.chain.push(newBlock);
    }
}

class Wallet{
    public publicKey:string;
    public privateKey:string; 
    constructor(){
        const keypair = crypto.generateKeyPairSync('rsa', {
            modulusLength:2048,
            publicKeyEncoding: {type:'spki', format:'pem'},
            privateKeyEncoding:{type:'pkcs8', format:'pem'}
        }); 
        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
    }
    sendMoney(amount:number, payeePublicKey:string){ 
        const transaction = new Transaction(amount, this.publicKey, payeePublicKey);
    }
}