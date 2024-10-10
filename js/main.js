Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
        <div class="product">
            <div class="product-image">
                <img id="img" v-bind:alt="altText" v-bind:src="image"/>
            </div>
            <div class="product-info">
                <h1>{{ title }}</h1>
                <p v-if="onSale">on sale</p>
                <p v-if="inStock">In stock</p>
                <p v-else :class="{ outOfStock: !inStock }">Out of Stock</p>
                <div class="color-box" @mouseover="updateProduct(index)" :style="{ backgroundColor: variant.variantColor }" v-for="(variant, index) in variants" :key="variant.variantId"></div>
                <div v-for="size in sizes">
                    <p>{{ size }}</p>
                </div>

                <button v-on:click="addToCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">Add to cart</button>
                <button v-on:click="removeFromCart">remove from cart</button>
            </div>

            <div>
                <product-tabs :shipping="shipping" :reviews="reviews"></product-tabs>
            </div>
            <a v-bind:href="link"> {{ linkText }}</a>
        </div>`,
    data() {
        return {
            product: "Socks",
            brand: "Vue Mastery",
            desc: "A pair of warm, fuzzy socks.",
            altText: "A pair of socks",
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            linkText: "More products like this",
            inventory: 100,
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10,
                    variantSale: true,
                    maxQuantity: 10 
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 10,
                    variantSale: true,
                    maxQuantity: 15 
                }
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            cart: {},
            selectedVariant: 0,
            reviews: []
        }
    },
    methods: {
        addToCart() {
            const variantId = this.variants[this.selectedVariant].variantId;
            const currentCount = this.cart[variantId] || 0;
            const maxQuantity = this.variants[this.selectedVariant].maxQuantity;

            if (currentCount < maxQuantity) {
                this.$emit('add-to-cart', variantId);
                this.cart[variantId] = currentCount + 1; // 
            } else {
                alert(`Вы можете добавить ${maxQuantity} ${this.variants[this.selectedVariant].variantColor} носков в корзину.`);
            }
        },
        updateProduct(index) {
            this.selectedVariant = index;
        },
        removeFromCart() {
            const variantId = this.variants[this.selectedVariant].variantId;
            this.$emit('remove-from-cart', variantId);
            if (this.cart[variantId]) {
                this.cart[variantId]--; // 
                if (this.cart[variantId] === 0) {
                    delete this.cart[variantId]; 
                }
            }
        },
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity > 0;
        },
        onSale() {
            return this.variants[this.selectedVariant].variantSale;
        },
        shipping() {
            return this.premium ? "free" : 2.99;
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview);
        });
    }
});


Vue.component('product-detail', {
    template: `
    <ul>
        <li v-for="detail in details" :key="detail">{{ detail }}</li>
    </ul>
    `,
    data() {
        return { details: ['80% cotton', '20% polyester', 'Gender-neutral'] }
    }

})

Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">
        <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
            <ul>
                <li v-for="error in errors">{{ error }}</li>
            </ul>
        </p>
        <p>
            <label for="name">Name:</label>
            <input id="name" v-model="name" placeholder="name">
        </p>
        <p>
            <label for="review">Review:</label>
            <textarea id="review" v-model="review"></textarea>
        </p>
        <p>
            <label for="rating">Rating:</label>
            <select id="rating" v-model.number="rating">
            <option>5</option>
            <option>4</option>
            <option>3</option>
            <option>2</option>
            <option>1</option>
            </select>
        </p>
        <p>
            <label for="recommend">Would you recommend this product?</label>
            <input type="radio" id="recommend" v-model="recommend" value="yes"> yes
            <input type="radio" id="recommend" v-model="recommend" value="no"> no
        </p>
        <p>
        <input type="submit" value="Submit">
        </p>
    </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommend = null
            } else {
                if (!this.name) this.errors.push("Name required.")
                if (!this.review) this.errors.push("Review required.")
                if (!this.rating) this.errors.push("Rating required.")
            }
        }
    }
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        },
        shipping: {
            type: String,
            required: true
        },
    },
    template: `
    <div>
        <ul>
            <span class="tab" v-for="(tab, index) in tabs" @click="selectedTab = tab" :class="{ activeTab: selectedTab === tab }">{{ tab }}</span>
        </ul>
        <div  v-show="selectedTab === 'Reviews'" >
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul>
                <li v-for="review in reviews">
                    <p>{{ review.name }}</p>
                    <p>Rating: {{ review.rating }}</p>
                    <p>{{ review.review }}</p>
                    <p>{{ review.recommend }}</p>
                    <button v-on:click="deleteReviews(review)">delete</button>
                </li>
            </ul>
        </div>
        <div v-show="selectedTab === 'Make a Review'">
            <product-review></product-review>
        </div>
        <div v-show="selectedTab === 'Shipping'">
            <p>Shipping : {{ shipping }}</p>
        </div>
        <div v-show="selectedTab === 'Details'">
            <product-detail></product-detail>
        </div>

    </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews',
        }
    },
    methods:{
        deleteReviews(id){
            console.log(id);
            let index = this.reviews.findIndex(function(e) {
                return (e.name == id.name && e.review == id.review && e.rating == id.rating && e.recommend == id.recommend);
            });
            console.log(index);
            if (index !== -1) {
                this.reviews.splice(index, 1);
            }  
        }
    }

})

let eventBus = new Vue()


let app = new Vue({
    el: "#app",
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
            const getImg = document.getElementById('img');
            getImg.classList.add('animate');
            setTimeout(() => {
                getImg.classList.remove('animate');
            }, 1000);
        },
        removeCart(id) {
            const index = this.cart.indexOf(id);
            if (index !== -1) {
                this.cart.splice(index, 1);
            }
        }
    }
})