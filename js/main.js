var app = new Vue({
    el: '#app',
    data: {
        product: 'Socks',
        description: 'A pair of warm fuzzy socks',
        image: "./assets/vmSocks-green-onWhite.jpg",
        link: 'https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks',
        altText: "A pair of socks",
        inStock: true,
        inventory: 100
    }
})