import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
const portable=p=>p.replaceAll('\\','/');

export function assemble(manifestFile) {
  const configPath=path.resolve(manifestFile),base=path.dirname(configPath);
  const config=JSON.parse(fs.readFileSync(configPath,'utf8'));
  if(!Array.isArray(config.fixedSources)||!config.fixedSources.length||!config.factsFile||!config.outputDir)
    throw Error('Manifest requires fixedSources, factsFile and outputDir');
  const sources=config.fixedSources.map(p=>fs.realpathSync(path.resolve(base,p)));
  const factsFile=fs.realpathSync(path.resolve(base,config.factsFile));
  if(sources.includes(factsFile))throw Error('Current facts cannot be a fixed source');
  const outputDir=path.resolve(base,config.outputDir);
  const names=['contract.md','facts.md','startup.txt','context-manifest.json'];
  for(const name of names) {
    const dest=path.join(outputDir,name);
    if([factsFile,...sources].includes(dest))throw Error('Output would overwrite an input');
    if(fs.existsSync(dest)&&fs.lstatSync(dest).isSymbolicLink())throw Error('Output file is a link');
  }
  fs.mkdirSync(outputDir,{recursive:true});
  const sourceHashes=[];
  const blocks=sources.map(file=>{
    const text=fs.readFileSync(file,'utf8');
    sourceHashes.push({file:portable(file),sha256:digest(text)});
    // Render accessible local reference paths without embedding deployment facts in policy.
    const linked=text.replace(/\]\(([^)\n]+)\)/g,(original,target)=>{
      if(/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(target))return original;
      const [relative,...anchor]=target.split('#');
      return ']('+portable(path.resolve(path.dirname(file),relative))+(anchor.length?'#'+anchor.join('#'):'')+')';
    });
    return linked.trim();
  });
  const contract=blocks.join('\n\n---\n\n')+'\n';
  const facts=fs.readFileSync(factsFile,'utf8');
  const startup=contract+'\n---\n\n# Task facts snapshot\n\nCanonical current facts: '+portable(factsFile)+
    '\nRead the canonical current facts before mutation and after restore. This embedded snapshot may be stale; never overwrite newer facts with it.\n\n'+facts.trim()+'\n';
  const result={version:1,status:'rendered-not-activated',sources:sourceHashes,
    factsSource:portable(factsFile),contractSha256:digest(contract),factsSha256:digest(facts),
    startupSha256:digest(startup),outputDir:portable(outputDir)};
  for(const [name,text] of [['contract.md',contract],['facts.md',facts],['startup.txt',startup],
    ['context-manifest.json',JSON.stringify(result,null,2)+'\n']])fs.writeFileSync(path.join(outputDir,name),text,'utf8');
  return result;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  if(!process.argv[2])throw Error('Usage: node assemble-seat-context.mjs manifest.json');
  console.log(JSON.stringify(assemble(process.argv[2])));
}
