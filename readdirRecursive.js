const { readdir } = require('fs/promises');
const { join } = require('path');

const readdirRecursive = async dir => {
  const files = await readdir( dir, { withFileTypes: true } );

  const paths = files.map( async file => {
    const path = join( dir, file.name );

    if ( file.isDirectory() ) return await readdirRecursive( path );

    return path;
  } );

  return ( await Promise.all( paths ) ).flat( Infinity );
}

module.exports = {
  readdirRecursive,
}