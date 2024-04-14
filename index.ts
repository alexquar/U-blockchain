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
    public nonce = Math.round(Math.random()*999999999);
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
        this.chain = [new Block('', new Transaction(100, 'genesis', 'alex'))];
    }
    get lastBlock(){
        return this.chain[this.chain.length -1];
    }
    addBlock(transaction:Transaction, senderPublicKey:string, signature:Buffer){
        const verifier = crypto.createVerify('SHA256');
        const isValid = verifier.verify(senderPublicKey, signature);
        if(isValid){
            const newBlock = new Block(this.lastBlock.hash, transaction);
            this.chain.push(newBlock);
        }
    }
    mine(nonce:number){
        let solution = 1;
        console.log(' we are mining...')
    
        while(true) {
    
          const hash = crypto.createHash('MD5');
          hash.update((nonce + solution).toString()).end();
    
          const attempt = hash.digest('hex');
    
          if(attempt.substr(0,4) === '0000'){
            console.log(`Solved: ${solution}`);
            return solution;
          }
        solution+=1
    }
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
        const sign = crypto.createSign('SHA256')
        sign.update(transaction.toString()).end()
        const signature = sign.sign(this.privateKey)
        Chain.instance.addBlock(transaction, this.publicKey, signature)
    }
}

//example for use

const alex = new Wallet()
const bill = new Wallet()
const katie = new Wallet()
alex.sendMoney(50, bill.publicKey)
bill.sendMoney(23, katie.publicKey)
katie.sendMoney(5, bill.publicKey)
console.log(Chain.instance)