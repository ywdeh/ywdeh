<script>
    import ImageGallery from "$lib/components/imageGallery.svelte";
</script>

<img src="https://cdn.dribbble.com/userupload/48290150/file/352736718653730faf1720d927251905.png?resize=1920x1080&vertical=center" alt="">

<article>
    <p><span class="font-semibold">Before we start:</span> This is a personal UI redesign concept for Paladins. All original game assets, characters, and trademarks belong to Hi-Rez Studios. The redesign elements and layout are my own creative work. This project is non-commercial and made for entertaining, education purposes only.</p>
    <p>This project contains a lot of pictures, explanation and many rough edges. Paladins style influenced me in many ways, and I use some of the aspects even in my current works. Everything published here is my contribution to the community, and my tribute to developers.</p>
    <p>It was also posted on <a href="https://www.reddit.com/r/Paladins/s/Q1U5ZDQB2V" target="_blank">reddit</a> and received a lot of positive feedback from the player base.</p>
</article>

<article>
    <h1>#1 Main Menu - lobby, in queue</h1>
    <p>Paladins has a lot of features, currencies and buttons. It is no easy job to combine everything into clean layout, keep readability and accessibility.</p>
    <p>Main focus was to improve visual convenience of the game's interface, but some of the screens had changed from the ground up.</p>
</article>

<img src="https://cdn.dribbble.com/userupload/48290150/file/352736718653730faf1720d927251905.png?resize=1920x1080&vertical=center" alt="">

<article>
    <h1>#2 Main Menu - match found</h1>
    <p>You see this popup when both your and opposite teams are formed. It shows players as their profile pictures, and asks if you're ready for a match. It might seem insignificant, but people actually spend a lot of time here, so my goal was to make the screen a little more entertaining.</p>
</article>

<img src="https://cdn.dribbble.com/userupload/48290149/file/82ffb9c78080595380f3c11c4a8313b4.png?resize=1920x1080&vertical=center" alt="">

<article>
    <p>You can now refuse to join the match, which was never possible in a base game. It is no longer a plain white rectangle, comparing to default interface.</p>
    <p>All we had before is a confirmation button. It is possible to see now how much time it took to find a match, and it also shows competitive rank range of a whole lobby. In a long run, that is a visual effect that shows people their ranked progression.</p>
</article>

<article>
    <h1>#3 Main Menu - champions list</h1>
    <p>Paladins has always struggled with a champion list, and they did redesigned it countless times.</p>
    <p>The amount of characters at the moment was already greater than 50, and you always had to scroll to find the character you need.</p>
    <p>In that concept I kind of solved the problem while keeping scrolling opportunities for the future.</p>
</article>

<img src="https://cdn.dribbble.com/userupload/48290153/file/67438f4116c06f9e35ab7f1c331259a4.png?resize=1920x1080&vertical=center" alt="">

<article>
    <p>New set of sorting rules was applied: your most popular and leveled characters listed first, followed by temporarily available ones. Locked characters arranged alphabetically at the end of the list.</p>
</article>

<article>
    <h1>#4 Some of the icons</h1>
    <p>Original assets were blurry, cause there's no proper place to get them. To keep concept clean I decided to re-create them, but without spending too much time. That's why some of the edges are rough.</p>
    <p>Last 2 icons are Profile picture and Profile frame, and I remade them from scratch. They now actually represent what they mean.</p>
</article>

<img src="https://cdn.dribbble.com/userupload/48290151/file/5c3ae99a3c6c1ca3f2b3b1c758cf1b9b.png?resize=1095x441&vertical=center" alt="">

<article>
    <h1>#5 Main Menu - bonus</h1>
    <p>It was done some time after the first concept. This one supposed to be the cleanest version with no excess features and currencies, as if the game just launched or re-launched yesterday.</p>
    <p>It didn't go far, but its fun. And- I still like the currency icons I came up with!</p>
</article>

<ImageGallery pictures={[
    { src: "scenario/paladins_menu_2.webp", alt: "" },
    { src: "scenario/paladins_currency.webp", alt: "" },
]} />

<article>
    <h1>#6 In Game - item store</h1>
    <p>Now this might be one of the most important screens of all concept. Paladins is a hero shooter, and every time you respawn, you barely have 15 seconds to open the item store, browse it and upgrade your character</p>
    <p>Menu has to be easily readable to ensure that new and competitive players are not slowed down by it.</p>
</article>

<img src="https://cdn.dribbble.com/userupload/48290152/file/b4c9ea5fededf37aa9721b1198f8114e.png?resize=1920x1080&vertical=center" alt="">

<article>
    <p>The layout is pretty much the same, but visuals are drastically different. In years, default interface has become mix of odd elements: some of the things hasn't changed since beta, newer elements looked out of place and some of them overlapped each other. I wanted to fix all these details and refine both looks and user experience.</p>
    <p>Not only visuals, but mechanics changed as well. Some items are now highlighted as recommended if they fit context of the match. You can clearly see which item is unusable on your current champion, which one is already maxed out, their prices and levels.</p>
    <p>For the future, there's now enough space for a new set of items. As part of the project I also reworked all of the items, unified their descriptions and the way they works. Unfortunately, since its not a design decision, there will be no much details about that.</p>
</article>

<article>
    <h1>#7 In Game - HUD</h1>
    <p>In-game's HUD always looked fine. Some of the textures might seem a bit dated, but not much.</p>
    <p>So I decided to completely change how it looks and feels. Still fantasy, but with a nice modern touch.</p>
</article>

<ImageGallery pictures={[
    { src: "scenario/paladins_hud.webp", alt: "" },
    { src: "scenario/paladins_hud_grayscale.webp", alt: "" },
    { src: "scenario/paladins_hud_ingame.webp", alt: "" },
]} />


<article>
    <p>Does that diamond shape seems familiar? As inspiration for that I used an iconic dice from Dungeons and Dragons. It very well represents ultimate abilities in the game as well: you either success landing it- or critically miss the opportunity.</p>
</article>

<article>
    <h1>#8 Main Menu - character customization</h1>
    <p>We're getting into something that I can easily label as unfinished. Character customization is half-done, but there's one thing I love about it: it screams Paladins. You can see the outline of Paladins logo behind the character.</p>
    <p>There's loadouts in the game, and cards are crucial part of character balancing. Previously there was no way to see which cards are changed in a recent update, so I added a little notification - "cards changed", so you can at least know that something here is not the way it was.</p>
</article>

<img src="https://cdn.dribbble.com/userupload/48290538/file/36cbb8acf9f2a03ef4bfb7e8cf8aa738.png?resize=1920x1080&vertical=center" alt="">

<article>
    <h1>#9 Other unfinished things</h1>
    <p>In game, you can customize three elements: your profile picture, title and frame. Inside the frame is the art of a character you play with.</p>
    <p>The concept was simple: you just click on the outline of the element you want to change. It also helps new players to understand what these elements are.</p>
</article>

<img src="https://cdn.dribbble.com/userupload/48290540/file/a63977c78b58a193d59f2b1f4d604bbe.png?resize=1920x1080&vertical=center" alt="">

<article>
    <h1>Afterword</h1>
    <p>As mentioned, Paladins has influenced me as a designer a lot. It's their team that inspired me to spend hours and days grinding software and knowledge to become better.</p>
    <p>All the time spent on these concepts and many more ideas behind the scenes is the time I will never regret spending!</p>
</article>