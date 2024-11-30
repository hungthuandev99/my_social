export const isEmptyObject = (obj: object): boolean => {
  return !Object.keys(obj).length;
};

export const getSchemaPopulate = (
  paths: string[],
  selectFields?: string[]
): any => {
  // If no 'path' is provided, return null or an empty array
  if (paths.length === 0) {
    return;
  }

  // Create a populate structure from the list of paths
  const createNestedPopulate = (pathList: string[]): any => {
    // If the list contains only one path, return a populate object with only the child path
    if (pathList.length === 1) {
      return { path: pathList[0], select: selectFields };
    }

    // Split the first part of the path, leaving the rest as 'subPath'
    const [currentPath, ...remainingPaths] = pathList;

    // Recursively create 'populate' for the child paths
    return {
      path: currentPath,
      populate: createNestedPopulate(remainingPaths),
    };
  };

  // Call the function to generate the populate structure from the array of 'paths'
  return paths.map((path) => createNestedPopulate(path.split(".")));
};
