<template>
    <div>
        <transition enter-active-class="animate__animated animate__fadeIn animate__faster" leave-active-class="animate__fadeOut animate__animated animate__faster">
            <div v-show="show" class="fixed inset-0 z-50 overflow-y-auto">
                <div class="flex justify-center">
                    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" aria-hidden="true"></div>
                    <transition enter-active-class="animate__animated animate__zoomIn animate__faster" leave-active-class="animate__animated animate__zoomOut animate__faster">
                        <div v-show="show" class="transform flex justify-center my-8 w-full">
                            <slot></slot>
                        </div>
                    </transition>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
export default {
    props: {
        show: Boolean
    }
}
</script>