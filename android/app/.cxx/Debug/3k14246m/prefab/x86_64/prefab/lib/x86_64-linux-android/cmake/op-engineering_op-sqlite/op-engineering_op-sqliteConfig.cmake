if(NOT TARGET op-engineering_op-sqlite::op-sqlite)
add_library(op-engineering_op-sqlite::op-sqlite SHARED IMPORTED)
set_target_properties(op-engineering_op-sqlite::op-sqlite PROPERTIES
    IMPORTED_LOCATION "C:/Users/hp/Desktop/Spotify/node_modules/@op-engineering/op-sqlite/android/build/intermediates/cxx/Debug/5l55b334/obj/x86_64/libop-sqlite.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/hp/Desktop/Spotify/node_modules/@op-engineering/op-sqlite/android/build/headers/op-sqlite"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

