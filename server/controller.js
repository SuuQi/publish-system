
export async function home (ctx) {
    let data = {};

    await ctx.render('index.ejs', { data });
}
