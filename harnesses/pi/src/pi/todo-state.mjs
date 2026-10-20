// Pi examples/extensions/todo.ts reconstructs state from the active branch's
// tool-result details. The only compatibility addition here reads the old
// harness_plan tool result; the runtime DB is never a TODO authority.
export function todoStateFromBranch(branch) {
  let state={todos:[],nextId:1};
  let native=false;
  for(const entry of branch) {
    if(entry.type!=='message'||entry.message.role!=='toolResult')continue;
    const message=entry.message;
    if(message.toolName==='todo'&&message.details) {
      state={todos:structuredClone(message.details.todos),nextId:message.details.nextId};
      native=true;
    } else if(!native&&message.toolName==='harness_plan'&&message.details?.steps) {
      state.todos=message.details.steps.map((s,i)=>({id:i+1,text:s.title,done:['completed','not_needed'].includes(s.status)}));
      state.nextId=state.todos.length+1;
    }
  }
  return state;
}
