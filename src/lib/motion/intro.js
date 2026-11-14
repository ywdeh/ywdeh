import { reduced_motion } from './settings.js';
export function reveal_intro({ main, identity, content, ready }) {
    let disposed = false;
    let context;
    let split;
    let finished = false;
    const finish = () => {
        if (disposed || finished) return;
        finished = true;
        ready();
    };
    const show = () => {
        if (disposed) return;
        for (const node of [main, identity, content]) node.style.opacity = '1';
        finish();
    };
    if (reduced_motion()) show();
    else {
        Promise.all([import('gsap'), import('gsap/SplitText')])
            .then(([{ gsap }, { SplitText }]) => {
                if (disposed) return;
                gsap.registerPlugin(SplitText);
                context = gsap.context(() => {
                    let revealed = false;
                    const reveal_content = () => {
                        if (revealed || disposed) return;
                        revealed = true;
                        gsap.to([identity, content], {
                            opacity: 1,
                            duration: 0.5,
                            ease: 'power2.inOut',
                            onComplete: finish,
                        });
                    };
                    gsap.to(main, { opacity: 1, duration: 0.7, ease: 'power2.inOut' });
                    split = SplitText.create(main.querySelector('.split'), {
                        type: 'lines',
                        autoSplit: true,
                        onSplit: (self) =>
                            gsap.from(self.lines, {
                                y: 30,
                                opacity: 0,
                                delay: 0.2,
                                stagger: 0.1,
                                ease: 'power1.inOut',
                                onComplete: () => {
                                    self.revert();
                                    reveal_content();
                                },
                            }),
                    });
                }, main);
            })
            .catch(show);
    }
    return () => {
        disposed = true;
        split?.revert();
        context?.revert();
    };
}
