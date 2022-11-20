const get = (path) => async () => {
  return await fetch(path).then(response => response.json());
}

export const get_goals = get('/goals/')
export const get_packages = get('/packages/')
export const get_sections = get('/sections/')
