// md5.mjs
import { createHash } from 'node:crypto';

// 要加密的字符串
const input = 'OzxyZbbSXnLcc3Qk6g6LYtrA1742107486790Al47bzdSSyMW0I4SZ0QnmQEvgmzcNYawMks6RQZyoOQ0oh0cQNTqTKkvHpmbXF8S';

// 生成 MD5 哈希值
const md5Hash = createHash('md5').update(input).digest('hex');
console.log(md5Hash); // 输出：5eb63bbbe01eeed093cb22bb8f5acdc3