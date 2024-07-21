// https://stackoverflow.com/a/46842181
export const filterAsync = async (arr: any[], filter: (item: any) => Promise<boolean>) => {
    const fail = Symbol();
    return (await Promise.all(arr.map(async item => (await filter(item)) ? item : fail))).filter(i => i !== fail);
}