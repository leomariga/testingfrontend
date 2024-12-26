<template>
  <card class="card-user">
    <template #image>
      <img src="https://ununsplash.imgix.net/photo-1431578500526-4d9613015464?fit=crop&fm=jpg&h=300&q=75&w=400" alt="..."/>
    </template>
    <div class="author">
      <a href="#">
        <img class="avatar border-gray" src="img/faces/face-3.jpg" alt="..."/>

        <h4 class="title">Sarah Wilson<br />
          <small>sarahw</small>
        </h4>
      </a>
    </div>
    <p class="description text-center"> "Software developer by day<br>
      Photography enthusiast by night<br>
      Always learning something new"
    </p>
    <p class="text-center">
      <i class="fa fa-phone"></i> (555) 123-4567
    </p>
    <template #footer>
      <div class="text-center d-flex justify-content-center">
        <button href="#" class="btn btn-simple"><i class="fa fa-facebook-square"></i></button>
        <button href="#" class="btn btn-simple"><i class="fa fa-twitter"></i></button>
        <button href="#" class="btn btn-simple"><i class="fa fa-google-plus-square"></i></button>
      </div>
    </template>
  </card>
</template>
<script>
  import Card from '@/components/Cards/Card.vue'
  export default {
    components: {
      Card
    },
    data () {
      return {
        details: [
          {
            title: '12',
            subTitle: 'Files'
          },
          {
            title: '2GB',
            subTitle: 'Used'
          },
          {
            title: '24,6$',
            subTitle: 'Spent'
          }
        ]
      }
    },
    methods: {
      getClasses (index) {
        var remainder = index % 3
        if (remainder === 0) {
          return 'col-md-3 col-md-offset-1'
        } else if (remainder === 2) {
          return 'col-md-4'
        } else {
          return 'col-md-3'
        }
      }
    }
  }

</script>
<style>

</style>
