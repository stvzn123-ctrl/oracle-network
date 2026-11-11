/* Only calendar years followed by a month are abbreviated; durations remain unchanged. */
(()=>{
 const format=t=>String(t).replace(/\b((?:19|20|21)\d{2})년(?=\s*\d{1,2}월)/g,(_,y)=>y.slice(2)+'년');
 const skip=n=>n.parentElement?.closest('script,style,textarea,input,[contenteditable="true"]');
 const visit=node=>{
  if(node.nodeType===3){if(!skip(node)){const next=format(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next;}return;}
  if(node.nodeType!==1&&node.nodeType!==11)return;
  if(node.nodeType===1&&node.matches('script,style,textarea,input,[contenteditable="true"]'))return;
  if(node.nodeType===1)for(const attr of ['title','aria-label']){const value=node.getAttribute(attr);if(value&&format(value)!==value)node.setAttribute(attr,format(value));}
  for(const child of node.childNodes)visit(child);
  if(node.nodeType===1&&node.tagName==='TEMPLATE')visit(node.content);
 };
 visit(document.body);
 new MutationObserver(records=>{for(const r of records){if(r.type==='characterData')visit(r.target);else for(const n of r.addedNodes)visit(n);}}).observe(document.body,{subtree:true,childList:true,characterData:true});
})();
