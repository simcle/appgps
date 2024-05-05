<template>
    <div @click.prevent="show = !show">
        <slot></slot>
        <div 
            class="absolute z-10 border leading-none mt-0.5 bg-white py-2 rounded shadow-lg"
            :class="{'right-0': right}"
            v-show="show"
        >
            <slot name="dropdown"></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DropDownMenu',
    props: {
        modelValue: Boolean,
        right: Boolean,
    },
    data () {
        return {
            show: false
        }
    },
    mounted () {
        document.body.addEventListener('click', this.closeMenu)
    },
    destroyed () {
        document.body.removeEventListener('click', this.closeMenu)
    },
    methods: {
        open () {
            this.show = true
        },
        closeMenu ($event) {
            if(!$event || !this.$el.contains($event.target)) {
                this.show = false
            }
        }
    },
}
</script>