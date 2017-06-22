try {
  // Line number should be 3
  throw new Error('oups');
} catch (e) {
  console.log(e.stack.split('\n')[1]);
}
