from django.urls import path

from app.views import (
    index,
    submit_delete,
    submit_get,
    submit_post,
    submit_put,
    user_lists,
)


urlpatterns = [
    path("", index, name="home"),
    path("lists/<int:page>/", user_lists, name="lists"),
    path("submit/get/", submit_get),
    path("submit/post/", submit_post),
    path("submit/put/", submit_put),
    path("submit/delete/", submit_delete),
]
